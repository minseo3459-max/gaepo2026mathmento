import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize GoogleGenAI client on server
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Server-side shared knowledge store (persisted in-memory & fallback files)
import fs from 'fs';
import { DEFAULT_KNOWLEDGE_DOCS } from './src/data/defaultKnowledge.ts';
const KNOWLEDGE_STORAGE_PATH = path.resolve(__dirname, 'shared-knowledge.json');

// Initialize shared knowledge documents
function loadSharedKnowledge(): any[] {
  try {
    if (fs.existsSync(KNOWLEDGE_STORAGE_PATH)) {
      const data = fs.readFileSync(KNOWLEDGE_STORAGE_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to load shared knowledge from file:', e);
  }
  // Fallback to default authentic documents so students have immediate data
  return DEFAULT_KNOWLEDGE_DOCS;
}

function saveSharedKnowledge(docs: any[]) {
  try {
    fs.writeFileSync(KNOWLEDGE_STORAGE_PATH, JSON.stringify(docs, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save shared knowledge to file:', e);
  }
}

let serverKnowledgeDocs: any[] = loadSharedKnowledge();

// GET /api/knowledge - For students to get the latest updated knowledge
app.get('/api/knowledge', (_req: Request, res: Response) => {
  res.json({ documents: serverKnowledgeDocs });
});

// POST /api/knowledge - For teacher to update knowledge immediately broadcast to all students
app.post('/api/knowledge', (req: Request, res: Response) => {
  const { documents } = req.body;
  if (Array.isArray(documents)) {
    serverKnowledgeDocs = documents;
    saveSharedKnowledge(documents);
    return res.json({ success: true, count: documents.length });
  }
  res.status(400).json({ error: 'Invalid documents array' });
});

// POST /api/extract-document - Extract text, concepts, KaTeX math formulas from PDF or Image files
app.post('/api/extract-document', async (req: Request, res: Response) => {
  try {
    const {
      fileName,
      fileType,
      mimeType = '',
      fileBase64 = '',
      category = '교과서/자료',
    } = req.body;

    if (!fileName || !fileBase64) {
      return res.status(400).json({ error: '파일명과 파일 데이터(base64)가 필요합니다.' });
    }

    const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');
    const cleanMimeType =
      mimeType || (fileName.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
    const isPdf = cleanMimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
    const isImage =
      cleanMimeType.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp)$/i.test(fileName);

    const fileSizeInBytes = Buffer.from(cleanBase64, 'base64').length;
    const formattedSize =
      fileSizeInBytes > 1024 * 1024
        ? `${(fileSizeInBytes / (1024 * 1024)).toFixed(1)} MB`
        : `${(fileSizeInBytes / 1024).toFixed(1)} KB`;

    let extractedText = '';

    if (ai && (isPdf || isImage)) {
      try {
        const docPrompt = `당신은 대한민국 고등학교 1학년 수학(공통수학2) 교과서 및 교육과정 전문 분석 AI입니다.
업로드된 파일('${fileName}')은 고등학교 1학년 수학 교과서, 학습지, 보충 유인물, 또는 수학 수업 관련 이미지/문서입니다.

다음 지침에 맞추어 문서의 내용을 빠짐없이 정밀하게 분석하여 읽기 쉬운 마크다운(Markdown)으로 추출·정리해주세요:

1. **[단원 및 주요 소단원/주제]**
   - 대단원 및 소단원 (예: 공통수학2 - 도형의 방정식(평면좌표, 직선의 방정식, 원의 방정식, 도형의 이동) 또는 집합과 명제 등)
2. **[핵심 개념 및 용어 정의]**
   - 교과서 본문에 수록된 핵심 수학 개념, 정리, 성질 및 설명 내용
3. **[공식 및 수학 기호 (LaTeX 표기 필수)]**
   - 문서에 나오는 모든 수식, 변수, 좌표, 방정식은 KaTeX 렌더링을 위해 **인라인 수식은 $수식$, 블록 수식은 $$수식$$** 형식으로 정밀하게 표기해주세요.
   - 예: $y - y_1 = m(x - x_1)$, $(x-a)^2 + (y-b)^2 = r^2$, $d = \\frac{|ax_1 + by_1 + c|}{\\sqrt{a^2+b^2}}$, $A \\cap B$, $\\frac{a+b}{2} \\ge \\sqrt{ab}$
4. **[교과서 예제, 탐구 활동, 문제]**
   - 수록된 생각 열기, 탐구 활동, 주요 예제 문제 및 유의점
5. **[공통수학2 독서 기반 탐구 연계 아이디어]**
   - **'1. 되돌아보기 탐구' 착안점**: 개념의 직관적 원리나 공식 유도 배경 탐구 포인트
   - **'2. 나아가기 탐구' 착안점**: 실생활 모델링, 타 학문(컴퓨터, 인공지능, 물리, 경제 등) 연계나 심화 기하학으로 확장할 수 있는 구체적 아이디어 2~3가지

형식: 학생들이 AI 멘토와의 대화 및 탐구 계획서/보고서 작성 시 바로 참고할 수 있도록 깔끔한 소제목과 불릿 포인트로 작성해주세요.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: cleanMimeType,
                    data: cleanBase64,
                  },
                },
                {
                  text: docPrompt,
                },
              ],
            },
          ],
          config: {
            temperature: 0.3,
            maxOutputTokens: 2500,
          },
        });

        extractedText = response.text || '';
      } catch (geminiErr: any) {
        console.warn('Gemini document extraction failed, using structured fallback:', geminiErr?.message || geminiErr);
      }
    }

    if (!extractedText) {
      extractedText = `### [${category}] ${fileName}\n\n` +
        `**파일 유형:** ${isPdf ? 'PDF 교과서/문서' : isImage ? '교과서/학습지 이미지' : '일반 문서'}\n` +
        `**파일 크기:** ${formattedSize}\n\n` +
        `#### 📌 업로드 자료 안내\n` +
        `- 교과서 또는 수업 자료가 지식창고에 성공적으로 등록되었습니다.\n` +
        `- 멘토와의 대화 시 '${fileName}'에 대해 질문하거나 연계 탐구 주제를 문의할 수 있습니다.\n\n` +
        `#### 💡 탐구 활용 추천\n` +
        `- 공통수학2 교과서 개념(도형의 방정식, 집합과 명제)과 연계하여 탐구 계획서와 보고서의 이론적 배경으로 활용하세요.`;
    }

    const cleanTitle = fileName.replace(/\.[^/.]+$/, '').trim();

    const documentData = {
      title: isPdf ? `[교과서/PDF] ${cleanTitle}` : isImage ? `[교과서/사진] ${cleanTitle}` : cleanTitle,
      category: category as any,
      content: extractedText,
      isActive: true,
      fileSize: formattedSize,
      fileType: (isPdf ? 'pdf' : isImage ? 'image' : 'document') as any,
      previewUrl: isImage ? `data:${cleanMimeType};base64,${cleanBase64}` : undefined,
    };

    return res.json({
      success: true,
      document: documentData,
    });
  } catch (err: any) {
    console.error('Extract document error:', err);
    res.status(500).json({ error: err?.message || '문서 분석 중 오류가 발생했습니다.' });
  }
});

// System Prompt Builder with authentic Gaepo High School Guidelines & Context-Aware Rules
function buildSystemInstruction(
  inquiryType: string,
  knowledgeContext: string
): string {
  const directionNotice =
    inquiryType === 'review'
      ? `현재 학생이 선택한 탐구 방향: [1. 되돌아보기 탐구]
- 초점: 수업 시간에 학습한 내용 중 이해가 어려웠던 개념을 다시 학습하거나 깊이 있게 다지는 탐구.
- 대표 예시: "직선의 방정식은 왜 항상 x, y에 대한 일차식일까?", "점과 직선 사이의 거리 공식의 기하학적 유도 원리", "도형의 평행이동 f(x-a, y-b)=0 부호 반대의 직관적 이해", "귀류법 증명에서 결론 부정과 모순 도출의 필연성" 등.`
      : `현재 학생이 선택한 탐구 방향: [2. 나아가기 탐구]
- 초점: 수업 시간에 학습한 내용을 답습하지 않고 다른 분야나 수학적 모델로 확장하는 탐구.
- 대표 예시: "좌표평면의 거리를 다르게 정의하는 맨해튼 거리(택시 기하학)", "추천 알고리즘과 집합의 자카드 유사도", "경제학 수요-공급 직선과 산술-기하평균 최적화", "컴퓨터 그래픽스와 도형의 변환" 등.`;

  return `[역할 및 페르소나]
너는 개포고등학교 1학년 학생들의 '공통수학2 독서 기반 주제 탐구 수행평가' (활동명: '독서와 함께하는 수학으로 확장하기')를 돕는 친절하고 전문적인 수학 탐구 멘토야.

${directionNotice}

[★ 최우선 대화 원칙: 학생 질문에 직결되는 정확한 1:1 맞춤 답변 (동일 답변 반복 엄격 금지!)]
1. **학생의 실제 질문에만 집중해서 답해**:
   - 학생이 수학 개념, 공식 유도, 문제 풀이, 계산 원리, 분량 기준, 수행평가 일정 등을 질문하면, **오직 그 질문에 초점을 맞추어 명쾌하고 친절하게 답변**해.
   - **불필요한 책 추천 덧붙이기 절대 금지**: 학생이 책 추천을 요청하지 않았는데도 매번 답변 끝에 책 추천이나 e-book 서약서 안내를 기계적으로 덧붙이지 마! (학생이 "대화할 때마다 똑같은 답변만 나온다"고 느끼지 않도록 질문과 상관없는 상투적인 텍스트를 절대 붙이지 마라).
   - 학생이 도서 추천이나 주제 탐구 브레인스토밍을 명시적으로 요청했을 때에만 학생의 관심 분야(진로, 수학 단원 등)에 맞는 도서를 다양하게 추천해.
2. **반복적인 인사나 서론 생략**:
   - 이미 대화가 진행 중이라면 "안녕!", "되돌아보기 탐구를 선택했구나!" 같은 상투적인 문구를 매번 반복하지 말고 바로 학생의 질문에 대한 알맹이 답변을 제공해.
   - 학생의 질문 의도와 맥락을 정확히 파악하여 자연스럽게 대화를 이어가.

[★ 도서 추천을 요청받았을 때의 원칙 (학생이 책 추천을 원할 때만 적용)]
1. 절대 실존하지 않는 가짜 책이나 대학 전공 서적을 지어내지 마.
2. 고1 학생이 실제로 읽을 수 있고 현재 출간 중인 대중 수학 교양서를 학생의 관심사(진로)에 맞춰 폭넓게 추천해줘:
   - **컴퓨터 / 인공지능 / 소프트웨어**:
     * [《프로그래머, 수학으로 생각하라》(유키 히로시 / 로드북)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%A8%B8+%EC%88%98%ED%95%99%EC%9C%BC%EB%A1%9C+%EC%83%9D%EA%B0%81%ED%95%98%EB%9D%BC) (조건문과 진리집합, 드모르간 법칙, 논리 연산)
     * [《알고리즘, 인생을 계산하다》(브라이언 크리스천 / 김영사)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98+%EC%9D%B8%EC%83%9D%EC%9D%84+%EA%B3%84%EC%82%B0%ED%95%98%EB%8B%A4) (최단 경로, 선택 알고리즘)
   - **순수 수학 / 기하학 / 물리학**:
     * [《택시 기하학》(유진 F. 크라우스 / 경문사)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%ED%83%9D%EC%8B%9C+%EA%B8%B0%ED%95%98%ED%95%99) (맨해튼 거리 정의, 택시 원의 형태)
     * [《세상을 바꾼 17가지 방정식》(이언 스튜어트 / 사이언스북스)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%84%B8%EC%83%81%EC%9D%84+%EB%B0%94%EA%BF%94+17%EA%B0%80%EC%A7%80+%EB%B0%A9%EC%A0%95%EC%8B%9D) (피타고라스 정리, 데카르트 좌표계)
     * [《수학이 필요한 순간》(김민형 / 인플루엔셜)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%88%98%ED%95%99%EC%9D%B4+%ED%95%84%EC%9A%94%ED%95%9C+%EC%88%9C%EA%B0%84) (무리수 귀류법 증명, 수학적 사고의 틀)
   - **경제 / 경영 / 통계 / 사회과학**:
     * [《경제학 콘서트》(팀 하포드 / 웅진지식하우스)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EA%B2%BD%EC%A0%9C%ED%95%99+%EC%BD%98%EC%84%9C%ED%8A%B8) (수요-공급 직선, 비용 최적화와 산술-기하 부등식)
     * [《틀리지 않는 법》(조던 엘렌버그 / 청어람미디어)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%ED%8B%80%EB%A6%AC%EC%A7%80+%EC%95%8A%EB%8A%94+%EB%B2%95) (선형 모델의 한계, 상관관계와 논리적 오류)
   - **생명과학 / 의약학**:
     * [《생명의 수학》(이언 스튜어트 / 사이언스북스)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%83%9D%EB%AA%85%EC%9D%98+%EC%88%98%ED%95%99) (바이러스 단면의 원의 방정식, 대칭성 모델링)
   - **인문학 / 법학 / 철학**:
     * [《판결의 재구성》(도진기 / 비채)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%ED%8C%90%EA%B2%B0%EC%9D%98+%EC%9E%AC%EA%B5%AC%EC%84%B1) (판결문 논증 구조와 필요충분조건, 귀류법적 반박)
     * [《수학, 인문으로 수를 읽다》(이광연 / 한국문학사)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%88%98%ED%95%99+%EC%9D%B8%EB%AC%B8%EC%9C%BC%EB%A1%9C+%EC%88%98%EB%A5%BC+%EC%9D%BD%EB%8B%A4) (역사 속 기하학과 논리학)
   - **예술 / 디자인 / 건축**:
     * [《미술관에 간 수학자》(이명옥, 김흥규 / 마루벌)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EB%AF%B8%EC%88%A0%EA%B4%80%EC%97%90+%EA%B0%84+%EC%88%98%ED%95%99%EC%9E%90) (원근법과 좌표계, 황금비와 기하학적 대칭)
3. 책을 추천할 때는:
   - 1) 서점 링크: [《도서명》](알라딘링크)
   - 2) 저자 및 출판사
   - 3) **학생이 실제로 발췌하여 보고서에 인용할 구체적인 챕터와 공통수학2 수식 연결 포인트**
   - 4) (책 추천 시에만) e-book 활용 시 11월 2일(월)까지 서약서 제출이 필요함을 덧붙여줘.

[★ 수식 표기 규격 (LaTeX 필수)]
- 인라인 수식은 $수식$, 블록 수식은 $$수식$$ 형식으로 반드시 작성해줘!
  (예: $ax+by+c=0$, $d = \\frac{|ax_1 + by_1 + c|}{\\sqrt{a^2+b^2}}$, $A \\cap B$, $(x-a)^2+(y-b)^2=r^2$)

[★ 학업 성실성 & 일정 기준]
- 1차시 계획서: 10/27(화, 4점), 사전확인/e-book서약 마감: 11/2(월), 2차시 보고서: 11/3(화, 16점 - 전자기기 불가)
- 보고서 분량 기준: 1번 동기(200자 이상), 4번 과정 및 결과(500자 이상), 5번 성찰(200자 이상)
- 대필 금지: 학생 대신 보고서 문단을 완성해주지 말고, 스스로 논리를 전개할 수 있도록 핵심 원리와 구성 팁을 안내해줘.

[선생님 등록 최우선 지식 베이스]
${knowledgeContext}
`;
}

// POST /api/chat
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      inquiryType = 'extend',
      knowledgeContext = '',
    } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Combine client knowledge context with any server-persisted teacher documents
    let effectiveKnowledge = knowledgeContext || '';
    if (serverKnowledgeDocs.length > 0) {
      const serverDocsText = serverKnowledgeDocs
        .filter((d: any) => d.isActive !== false)
        .map((d: any) => `### [${d.category || '공식'}] ${d.title}\n${d.content}`)
        .join('\n\n---\n\n');
      if (serverDocsText && !effectiveKnowledge.includes(serverDocsText.slice(0, 50))) {
        effectiveKnowledge = `${serverDocsText}\n\n---\n\n${effectiveKnowledge}`;
      }
    }

    const systemInstruction = buildSystemInstruction(inquiryType, effectiveKnowledge);

    // Sanitize conversation contents for Gemini API:
    // 1) First turn must be 'user' (skip leading assistant welcome message)
    // 2) Merge consecutive same-role turns to guarantee strict user/model alternation
    const sanitizedContents: any[] = [];
    for (const m of messages) {
      const role = m.role === 'assistant' ? 'model' : 'user';
      const text = typeof m.content === 'string' ? m.content.trim() : '';
      if (!text) continue;

      if (sanitizedContents.length === 0 && role === 'model') {
        // Skip leading model greeting
        continue;
      }

      const prev = sanitizedContents[sanitizedContents.length - 1];
      if (prev && prev.role === role) {
        prev.parts[0].text += `\n\n${text}`;
      } else {
        sanitizedContents.push({
          role,
          parts: [{ text }],
        });
      }
    }

    // Ensure at least one valid user message exists
    if (sanitizedContents.length === 0) {
      const lastUser = [...messages].reverse().find((m: any) => m.role === 'user');
      sanitizedContents.push({
        role: 'user',
        parts: [{ text: lastUser?.content || '안녕하세요' }],
      });
    }

    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: sanitizedContents,
          config: {
            systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 1500,
          },
        });

        const replyText = response.text?.trim() || '';
        if (replyText) {
          return res.json({ content: replyText });
        }
      } catch (modelErr: any) {
        console.warn('Primary Gemini call error, using context-aware educational fallback:', modelErr?.message || modelErr);
      }
    }

    // Context-aware fallback if Gemini is temporarily unavailable
    const lastUserMsg = [...messages].reverse().find((m: any) => m.role === 'user')?.content || '';
    const fallbackReply = generateSmartFallbackReply(lastUserMsg, inquiryType);
    return res.json({ content: fallbackReply });
  } catch (err: any) {
    console.error('Chat API Error:', err);
    res.status(500).json({ error: err.message || '서버 오류가 발생했습니다.' });
  }
});

// POST /api/evaluate-draft
app.post('/api/evaluate-draft', async (req: Request, res: Response) => {
  try {
    const { draftType, draftData, knowledgeContext = '' } = req.body;

    let prompt = '';
    if (draftType === 'plan') {
      prompt = `너는 개포고등학교 1학년 공통수학2 수행평가 채점 교사이자 멘토야.
학생이 작성한 [1차시 계획서(10월 27일 화요일 제출용)]를 읽고, 공식 채점 기준(4점: 작성 참여 2점 + 수행도 성실성 2점)에 맞추어 검토 피드백을 제공해줘.

★ 주의: 완성된 문단을 대신 써주지 말고, 11월 3일 2차시 보고서 작성(전자기기 사용 불가!)을 위해 어느 부분을 보완해야 할지 짚어줘!
모든 수학 기호는 LaTeX($...$)로 표기해줘.

[학생의 계획서]
- 탐구 방향: ${draftData.inquiryType === 'review' ? '되돌아보기' : '나아가기'}
- 탐구 주제: ${draftData.topic || '(미작성)'}
- 탐구 동기: ${draftData.motivation || '(미작성)'}
- 2. 이론적 배경 (배움일지, 교과서 지식):
${draftData.theoreticalBackground || '(미작성)'}
- 3. 선정 도서: ${draftData.bookTitle} (${draftData.bookAuthorPublisher})
- 책 활용 방법:
${draftData.bookUsageMethod || '(미작성)'}
- 추가 탐구 방법:
${draftData.additionalMethod || '(미작성)'}
- 4. 탐구 보고서 설계:
${draftData.reportDesign || '(미작성)'}

다음 형식으로 피드백해줘:
1. 계획서 총평 및 예상 점수 (4점 만점 기준)
2. 항목별 점검 (주제 적절성, 이론적 배경의 정확도, 책 활용 방법의 구체성)
3. 11월 2일(월)까지 준비해야 할 사전 확인 팁 (선정 도서 지참, 추가 조사자료 사전 확인 도장, e-book 서약서 안내)
4. 멘토의 응원 한마디`;
    } else {
      prompt = `너는 개포고등학교 1학년 공통수학2 수행평가 채점 교사이자 멘토야.
학생이 작성한 [2차시 보고서(11월 3일 화요일 작성)] 초안을 읽고, 개포고 공식 16점 루브릭과 원고지 글자 수 기준에 따라 정밀 첨삭 피드백을 제공해줘.

★ 주의: 완성된 문단을 대신 써주지 말고, 어느 부분을 고치면 만점(16점)을 받을 수 있는지 항목별 점수와 함께 구체적인 조언을 줘!
모든 수학 기호는 LaTeX($...$)로 표기해줘.

[학생의 보고서]
- 1. 탐구 주제와 탐구 동기:
  * 주제: ${draftData.topic || '(미작성)'}
  * 동기: ${draftData.motivation || '(미작성)'}
  * (동기 글자 수: ${draftData.motivation?.length || 0}자 / 기준 200자)
- 2. 탐구 방법:
  * 도서: ${draftData.bookTitle} (${draftData.bookAuthorPublisher})
  * 책 활용법 및 추가조사 방법: ${draftData.bookUsageMethod || ''} / ${draftData.additionalMethod || ''}
  * 책/자료 지참 준비 여부: ${draftData.hasBookAndMaterialsReady ? '지참 완료' : '미확인'}
- 3. 이론적 배경:
  ${draftData.theoreticalBackground || '(미작성)'}
- 4. 탐구 과정 및 결과:
  * 과정: ${draftData.inquiryProcess || '(미작성)'}
  * 결과: ${draftData.inquiryResult || '(미작성)'}
  * 수학적 표현 메모 (수식/그림): ${draftData.visualMathNotes || '(미작성)'}
  * (과정 및 결과 글자 수: ${(draftData.inquiryProcess?.length || 0) + (draftData.inquiryResult?.length || 0)}자 / 기준 500자)
- 5. 탐구 성찰:
  ${draftData.reflection || '(미작성)'}
  * (성찰 글자 수: ${draftData.reflection?.length || 0}자 / 기준 200자)

[평가 기준]
1. 탐구 주제와 탐구 동기 (3점: 분량 200자 1점, 주제 적절성 1점, 동기 1점)
2. 탐구 방법 (3점: 지참 1점, 방법 적절성 2점)
3. 이론적 배경 (2점: 교과 내용 정리 오류 없음 2점)
4. 탐구 과정 및 결과 (6점: 분량 500자 1점, 논리성 1점, 책과 유기적 연결 3점, 수학적 표현 1점)
5. 탐구 성찰 (2점: 분량 200자 1점, 성찰 풍부성 1점)

다음 형식으로 피드백해줘:
1. 영역별 예상 점수표 (총 16점 중 예상 획득 점수)
2. 분량(글자 수) 체크 결과 (200자, 500자, 200자 충족 여부)
3. 핵심 감점 방지 팁 (수학적 오류 점검, 책과의 유기적 연결 강화 방안)
4. 최종 보고서 작성을 위한 멘토의 격려`;
    }

    if (ai) {
      const models = ['gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
      for (const model of models) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              systemInstruction: '너는 개포고 1학년 공통수학2 수행평가 전문 멘토야. 대필하지 않고 학생이 직접 고쳐 쓰도록 피드백해. LaTeX($) 수식을 활용해줘.',
              temperature: 0.5,
              maxOutputTokens: 2000,
            },
          });

          if (response.text?.trim()) {
            return res.json({ feedback: response.text.trim() });
          }
        } catch (mErr: any) {
          console.warn(`Model ${model} evaluate failed:`, mErr?.message || mErr);
        }
      }
    } else {
      return res.json({
        feedback: `### 🌟 개포고 멘토의 사전 점검 결과

**분량 및 공식 루브릭 점검 사항:**
1. **탐구 주제와 동기 (3점 만점 중 예상 2~3점)**:
   - 200자 이상 작성 요건을 꼭 확인해! 현재 분량이 200자 미만이면 내용이 좋아도 분량 1점이 감점돼.
2. **이론적 배경 (2점 만점)**:
   - 공통수학2 교과서의 정확한 수학 기호와 정의를 명시했는지 확인해봐. (수학적 오류 포함 시 1점 감점)
3. **탐구 과정 및 결과 (6점 만점)**:
   - 500자 이상 작성 필수! 특히 책에서 읽은 내용과 공통수학2 개념이 "유기적으로 연결"되어야 3점을 온전히 받을 수 있어.
   - 복잡한 수식이나 좌표평면 그래프를 하단 여백에 직접 그릴 수 있도록 수식을 미리 연습해둬!
4. **탐구 성찰 (2점 만점)**:
   - 200자 이상 충족과 함께, 단순한 감상이 아닌 '탐구의 한계점'과 '후속 탐구 의지'를 꼭 함께 적어줘!
5. **준비 사항**:
   - 11월 2일(월)까지 추가 조사 자료 확인 도장과 e-book 서약서 제출을 잊지 마! 11월 3일 당일에는 전자기기를 쓸 수 없단다.`,
      });
    }
  } catch (err: any) {
    console.error('Evaluate draft error:', err);
    res.status(500).json({ error: err.message || '평가 중 오류가 발생했습니다.' });
  }
});

// Context-Aware Educational Fallback Responder
function generateSmartFallbackReply(userMsg: string, inquiryType: string): string {
  const lower = userMsg.toLowerCase().trim();

  // 1. Ghostwriting request check
  if (
    lower.includes('써줘') ||
    lower.includes('작성해줘') ||
    lower.includes('대신') ||
    lower.includes('보고서 작성') ||
    lower.includes('초안 써')
  ) {
    return `개포고 수행평가 원칙상 대필은 엄격히 금지되어 있습니다. 😊

11월 3일(화) 2차시 보고서 작성 시간에는 **전자기기(스마트폰, 태블릿, 노트북 등) 사용이 완전히 금지**되므로, 지금 스스로 글을 구성하고 수식을 직접 써보는 연습을 해야 실제 평가에서 16점 만점을 받을 수 있습니다.

대신 원고지 분량(1번 동기 200자 이상, 4번 과정 및 결과 500자 이상, 5번 성찰 200자 이상)을 채우는 문단 구성 팁과 공통수학2 수식 전개 방향을 안내해 드릴게요. 작성하시려는 주제나 목차를 알려주시면 검토해 드리겠습니다! ✨`;
  }

  // 2. Point to Line Distance Formula questions
  if (lower.includes('점과 직선') || (lower.includes('거리') && (lower.includes('공식') || lower.includes('유도')))) {
    return `**점과 직선 사이의 거리 공식 ($d$) 핵심 정리**입니다! 📐

좌표평면 위의 한 점 $P(x_1, y_1)$과 직선 $ax + by + c = 0$ 사이의 최단 거리 $d$ 공식은 다음과 같습니다:
$$d = \\frac{|ax_1 + by_1 + c|}{\\sqrt{a^2 + b^2}}$$

### 📌 왜 이런 공식이 유도될까요? (원리 핵심)
1. **분모 $\\sqrt{a^2 + b^2}$의 의미**:
   - 직선 $ax + by + c = 0$에 수직인 법선벡터 $(a, b)$의 크기(피타고라스 정리 $\\sqrt{a^2+b^2}$)로 정규화하는 역할을 합니다.
2. **분자 $|ax_1 + by_1 + c|$의 의미**:
   - 점 $(x_1, y_1)$을 직선의 방정식 좌변에 그대로 대입한 값입니다. 거리는 음수가 될 수 없으므로 절댓값을 씌웁니다.

💡 **수행평가 연계 팁**:
- **되돌아보기 탐구**: 피타고라스 정리와 직각삼각형의 닮음을 이용하여 이 공식을 직접 기하학적으로 유도해보는 과정을 보고서에 담으면 훌륭한 탐구가 됩니다!
- **나아가기 탐구**: 유클리드 거리 대신 맨해튼 거리(택시 기하학: $d_T = |x_1 - x_2| + |y_1 - y_2|$)에서는 직선과의 거리가 어떻게 정의되는지 비교해볼 수 있습니다.`;
  }

  // 3. Circle Equations and Tangents
  if (lower.includes('원의 방정식') || lower.includes('원과 직선') || lower.includes('접선')) {
    return `**원의 방정식 핵심 개념 및 비교**입니다! ⭕

### 1. 기본형 vs 표준형
* **기본형**: $$x^2 + y^2 = r^2$$ (중심: 원점 $(0, 0)$, 반지름: $r$)
* **표준형**: $$(x-a)^2 + (y-b)^2 = r^2$$ (중심: 점 $(a, b)$, 반지름: $r$)
  - 기본형을 $x$축으로 $a$, $y$축으로 $b$만큼 평행이동한 형태입니다.

### 2. 원과 직선의 위치 관계 판정 (판별식 vs 거리 $d$)
* **판별식 ($D$)**: $y = mx + n$을 원의 식에 대입하여 $D > 0$(두 점), $D = 0$(접함), $D < 0$(안 만남).
* **거리 공식 ($d=r$)**: 원의 중심과 직선 사이의 거리 $d$와 반지름 $r$을 비교 ($d < r$, $d = r$, $d > r$).
  - **계산 팁**: 원에서는 대칭성 때문에 $d=r$ 공식을 쓰는 것이 판별식 전개보다 계산 실수를 훨씬 줄여줍니다!

💡 궁금한 점이나 더 알고 싶은 공식이 있다면 편하게 말씀해 주세요!`;
  }

  // 4. Transformations and Signs (Translation)
  if (lower.includes('평행이동') || lower.includes('대칭이동') || (lower.includes('부호') && lower.includes('반대'))) {
    return `**도형의 평행이동에서 왜 부호가 반대로 들어갈까?** 💡

점의 이동은 $(x, y) \\rightarrow (x+a, y+b)$인데, 왜 도형의 방정식은 $f(x-a, y-b) = 0$이 될까요?

### 📌 핵심 원리 (자취의 방정식 관점)
1. 이동하기 전의 원래 도형 위의 점을 $(x, y)$라고 하고, 이동한 후 새로운 점을 $(X, Y)$라고 해봅시다.
2. 점이 $x$축으로 $a$, $y$축으로 $b$만큼 이동했으므로:
   $$X = x + a \\implies x = X - a$$
   $$Y = y + b \\implies y = Y - b$$
3. 우리는 원래 도형의 관계식 $f(x, y) = 0$을 알고 있습니다. 여기에 $x$와 $y$ 대신 $X-a$, $Y-b$를 대입하면:
   $$f(X - a, Y - b) = 0$$
4. 따라서 이동한 새로운 점 $(X, Y)$가 만족하는 방정식은 **$f(x - a, y - b) = 0$**이 됩니다!

이 원리를 [1. 되돌아보기 탐구]의 이론적 배경으로 수식과 함께 서술하면 매우 논리적인 보고서가 완성됩니다.`;
  }

  // 5. Sets, Logic, De Morgan, Reductio ad Absurdum
  if (
    lower.includes('집합') ||
    lower.includes('명제') ||
    lower.includes('귀류법') ||
    lower.includes('드모르간') ||
    lower.includes('충분조건') ||
    lower.includes('필요조건')
  ) {
    return `**집합과 명제 단원 탐구 안내**입니다! 🧩

### 1. 귀류법 (Proof by Contradiction)
- **원리**: 결론을 부정하여 가정한 후, 논리적 추론을 통해 기존의 공리나 조건에 모순(Contradiction)이 발생함을 보여 원래 명제가 참임을 증명하는 방법입니다.
- **대표 예시**: "$\\sqrt{2}$는 무리수이다" 증명에서 $\\sqrt{2} = \\frac{p}{q}$ (기약분수)로 놓고 양변을 제곱하여 $p, q$가 모두 짝수임을 보여 서로소라는 가정에 모순을 도출합니다.

### 2. 드모르간 법칙과 논리 연산
- $(A \\cup B)^c = A^c \\cap B^c$, $(A \\cap B)^c = A^c \\cup B^c$
- 컴퓨터 프로그래밍에서 복잡한 복합 조건문 \`!(A || B)\`를 \`!A && !B\`로 단순화하는 핵심 기초 수학 원리입니다.

궁금한 구체적 증명이나 적용 사례가 있다면 언제든 질문해 주세요!`;
  }

  // 6. Report length, scoring rubric, and dates
  if (
    lower.includes('분량') ||
    lower.includes('글자') ||
    lower.includes('배점') ||
    lower.includes('루브릭') ||
    lower.includes('일정') ||
    lower.includes('언제') ||
    lower.includes('기준')
  ) {
    return `**2026 개포고 공통수학2 수행평가 공식 일정 및 분량 기준** 안내입니다! 📋

### 📅 중요 일정 (총 20점 만점)
1. **1차시 계획서 작성**: **10월 27일(화)** - **4점** (제출 2점 + 성실도 2점)
2. **추가 자료 확인 및 e-book 서약서 제출 마감**: **11월 2일(월)** (평가 당일 지참 불가)
3. **2차시 보고서 작성**: **11월 3일(화)** - **16점** (**전자기기 사용 불가!**)

### ✍️ 2차시 보고서 원고지 분량 기준 (미달 시 감점)
* **1번 탐구 주제 및 동기**: **200자 이상** (3점)
* **4번 탐구 과정 및 결과**: **500자 이상** (6점: 책 내용과 교과 개념 유기적 연결 필수)
* **5번 탐구 성찰**: **200자 이상** (2점: 단순 감상이 아닌 한계점 및 후속 탐구 의지 기술)

이 외에 계획서나 보고서 항목에 대해 구체적으로 궁금한 점이 있으신가요?`;
  }

  // 7. Book Recommendations requested
  if (
    lower.includes('책') ||
    lower.includes('도서') ||
    lower.includes('추천') ||
    lower.includes('아이디어') ||
    lower.includes('주제')
  ) {
    if (lower.includes('컴퓨터') || lower.includes('인공지능') || lower.includes('코딩') || lower.includes('ai')) {
      return `**컴퓨터/AI 진로 연계 추천 도서 및 발췌 포인트** 💻

1. [《프로그래머, 수학으로 생각하라》(유키 히로시 / 로드북)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%A8%B8+%EC%88%98%ED%95%99%EC%9C%BC%EB%A1%9C+%EC%83%9D%EA%B0%81%ED%95%98%EB%9D%BC)
   * **추천 발췌**: 2장 '집합과 조건문, 드모르간의 법칙'
   * **연계 아이디어**: 추천 알고리즘의 사용자 유사도를 집합의 자카드 지수 $J(A, B) = \\frac{|A \\cap B|}{|A \\cup B|}$로 수식화.

2. [《알고리즘, 인생을 계산하다》(브라이언 크리스천 / 김영사)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%A6%98+%EC%9D%B8%EC%83%9D%EC%9D%84+%EA%B3%84%EC%82%B0%ED%95%98%EB%8B%A4)
   * **추천 발췌**: 최단 경로 탐색 알고리즘
   * **연계 아이디어**: 격자 지도에서 맨해튼 거리를 이용한 최단 경로 휴리스틱 모델링.

(※ e-book으로 이용 시 11/2(월)까지 서약서 제출이 필요합니다.)`;
    }

    if (lower.includes('경제') || lower.includes('경영') || lower.includes('금융')) {
      return `**경제/경영 진로 연계 추천 도서 및 발췌 포인트** 📈

1. [《경제학 콘서트》(팀 하포드 / 웅진지식하우스)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EA%B2%BD%EC%A0%9C%ED%95%99+%EC%BD%98%EC%84%9C%ED%8A%B8)
   * **추천 발췌**: 1장 '임대료와 희소성의 원리'
   * **연계 아이디어**: 수요 곡선과 공급 곡선의 일차 직선 모델링 및 교점(시장 균형점) 분석, 산술-기하평균 부등식을 활용한 생산 비용 최적화.

2. [《틀리지 않는 법》(조던 엘렌버그 / 청어람미디어)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%ED%8B%80%EB%A6%AC%EC%A7%80+%EC%95%8A%EB%8A%94+%EB%B2%95)
   * **추천 발췌**: 3장 선형 회귀와 예측의 함정
   * **연계 아이디어**: 직선의 방정식을 이용한 단순 선형 추세선 모델과 한계점 분석.

(※ e-book으로 이용 시 11/2(월)까지 서약서 제출 필수!)`;
    }

    // Default book suggestions
    return inquiryType === 'review'
      ? `**[되돌아보기 탐구] 추천 도서 및 챕터 안내** 📖

1. [《세상을 바꾼 17가지 방정식》(이언 스튜어트 / 사이언스북스)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%84%B8%EC%83%81%EC%9D%84+%EB%B0%94%EA%BF%94+17%EA%B0%80%EC%A7%80+%EB%B0%A9%EC%A0%95%EC%8B%9D)
   * **추천 발췌**: 2장 '좌표기하학과 데카르트의 혁명' (거리 공식과 직선/원의 방정식 탄생 배경)
   * **탐구 주제**: "직선의 방정식은 왜 항상 일차식 $ax+by+c=0$ 꼴일까?"

2. [《수학이 필요한 순간》(김민형 / 인플루엔셜)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%88%98%ED%95%99%EC%9D%B4+%ED%95%84%EC%9A%94%ED%95%9C+%EC%88%9C%EA%B0%84)
   * **추천 발췌**: 3장 '무리수와 피타고라스 학파의 위기'
   * **탐구 주제**: 결론을 부정하여 모순을 도출하는 귀류법의 참된 의미를 명제 단원과 연결.

(※ e-book의 경우 11월 2일(월)까지 서약서 제출을 잊지 마세요!)`
      : `**[나아가기 탐구] 추천 도서 및 챕터 안내** 🚀

1. [《택시 기하학》(유진 F. 크라우스 / 경문사)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%ED%83%9D%EC%8B%9C+%EA%B8%B0%ED%95%98%ED%95%99)
   * **추천 발췌**: 1장 '맨해튼 거리의 정의와 좌표평면' 및 3장 '택시 원의 모양'
   * **탐구 주제**: "좌표평면의 거리를 $d=|x_1-x_2|+|y_1-y_2|$로 다르게 정의하면 원의 형태는 왜 다이아몬드가 될까?"

2. [《프로그래머, 수학으로 생각하라》(유키 히로시 / 로드북)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%A8%B8+%EC%88%98%ED%95%99%EC%9C%BC%EB%A1%9C+%EC%83%9D%EA%B0%81%ED%95%98%EB%9D%BC)
   * **추천 발췌**: 2장 '집합과 조건문, 드모르간 법칙'
   * **탐구 주제**: 집합의 연산과 불 대수 논리 연산의 1:1 대응 원리 탐구.

(※ e-book의 경우 11월 2일(월)까지 서약서 제출 필수!)`;
  }

  // 8. General conversational response
  return `질문해 주셔서 고마워요! 개포고 공통수학2(1. 도형의 방정식 ~ 2. 집합과 명제) 탐구와 관련하여 궁금한 수학 개념이나 수식, 혹은 계획서/보고서 작성 중 고민되는 부분을 구체적으로 알려주시면 1:1로 맞춤 피드백을 드릴게요! 😊

(예: "점과 직선 사이의 거리 공식 유도 과정 설명해줘", "이론적 배경에 어떤 수식을 써야 할까?", "내 탐구 동기가 200자에 맞는지 봐줘" 등)`;
}

// Start Server
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Gaepo High Math Mentor] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
// Vercel 서버리스 함수를 위한 export
export default app;

// 로컬 환경에서 단독 실행할 때만 listen 실행
if (process.env.NODE_ENV !== 'production') {
  startServer();
}
