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

// System Prompt Builder with authentic Gaepo High School Guidelines & Book Link rule
function buildSystemInstruction(
  inquiryType: string,
  knowledgeContext: string
): string {
  const directionNotice =
    inquiryType === 'review'
      ? `현재 학생이 선택한 탐구 방향: [1. 되돌아보기 탐구]
- 초점: 수업 시간에 학습한 내용 중 이해가 어려웠던 개념을 다시 학습하는 탐구.
- 대표 예시: "직선의 방정식은 왜 항상 x, y에 대한 일차식일까?", "점과 직선 사이의 거리 공식의 기하학적 유도 원리", "도형의 평행이동 f(x-a, y-b)=0 부호 반대의 직관적 이해", "귀류법 증명에서 결론 부정과 모순 도출의 필연성" 등.
- 핵심 개념의 직관적 원리와 배경을 명쾌하고 간결하게 설명하고 학생이 스스로 생각할 수 있는 핵심 질문 1개를 던져줘.`
      : `현재 학생이 선택한 탐구 방향: [2. 나아가기 탐구]
- 초점: 수업 시간에 학습한 내용을 답습하지 않고 다른 분야나 깊이 있는 수학적 모델로 확장하는 탐구.
- 대표 예시: "좌표평면의 거리를 다르게 정의하는 맨해튼 거리(택시 기하학)", "추천 알고리즘과 집합의 자카드 유사도", "경제학 수요-공급 직선과 산술-기하평균 최적화" 등.
- 과도하게 어려운 대학 미적분으로 점프하지 않고, 1학년 공통수학2(도형의 방정식, 집합과 명제)의 수식과 기호로 실세계를 모델링하도록 유도해줘.`;

  return `[역할 및 페르소나]
너는 개포고등학교 1학년 학생들의 '공통수학2 독서 기반 주제 탐구 수행평가' (활동명: '독서와 함께하는 수학으로 확장하기')를 돕는 친절하고 전문적인 수학 탐구 멘토야.

${directionNotice}

[★ 핵심 지침: 학생의 요구사항에 딱 맞추어 간결하고 핵심적인 답변 (답변 속도 및 가독성 최적화)]
1. 장황하고 불필요한 서론이나 중복 인사는 생략하고, **학생이 질문한 내용에 직결되는 핵심 답변만 명쾌하게 제시**해.
2. 학생이 특정 질문(예: 수식 확인, 개념 질문, 글자수 체크)을 하면 구구절절 길게 늘어놓지 말고 학생 질문에 1:1로 초점을 맞춰서 답해줘.
3. 아이디어 추천이나 브레인스토밍을 요구받은 경우에만 2~3가지의 다양하고 폭넓은 아이디어를 명확한 불릿 포인트로 제시해줘.

[★ 도서 추천 엄격 원칙 (가짜 도서 및 고난도 대학 서적 절대 금지)]
1. 절대 실존하지 않는 가짜 책을 지어내지 마! 고1 학생 수준에 너무 어려운 대학 수준 서적(예: 괴델 에셔 바흐, 수학의 확실성, 심화 미적분학/추상대수 전문서 등)은 절대 배제해.
2. 오직 고1 학생이 실제로 읽을 수 있고 현재 출간/유통 중인 대중 수학 교양서만 엄선해 추천해줘:
   - 《택시 기하학》(유진 F. 크라우스)
   - 《수학이 필요한 순간》(김민형)
   - 《프로그래머, 수학으로 생각하라》(유키 히로시)
   - 《세상을 바꾼 17가지 방정식》(이언 스튜어트)
   - 《미술관에 간 수학자》(이명옥, 김흥규 또는 이광연)
   - 《틀리지 않는 법》(조던 엘렌버그)
   - 《경제학 콘서트》(팀 하포드)
   - 《생명의 수학》(이언 스튜어트)
   - 《판결의 재구성》(도진기)
   - 《알고리즘, 인생을 계산하다》(브라이언 크리스천)
   - 《수학, 인문으로 수를 읽다》(이광연)
3. 책을 추천할 때는 반드시 3가지를 명확히 짚어줘:
   - 1) 서점 링크: [《도서명》](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=[도서명URL인코딩])
   - 2) 저자 및 출판사
   - 3) **학생이 실제로 발췌하여 보고서에 인용할 구체적인 챕터와 내용** (예: "책의 2장 '좌표기하학'에서 두 점 사이의 거리 유도 부분을 발췌하여 인용하면 좋아")
   - (e-book의 경우 11월 2일(월)까지 e-book 활용 서약서 제출 필요를 한 줄 덧붙여줘)

[★ 수식 렌더링 (LaTeX 필수)]
- 답변의 모든 수학 기호, 수식, 변수는 KaTeX 렌더링을 위해 **인라인 수식은 $수식$, 블록 수식은 $$수식$$** 형식으로 작성해줘!
  (예: $ax+by+c=0$, $d = \\frac{|ax_1 + by_1 + c|}{\\sqrt{a^2+b^2}}$, $A \\cap B$, $A \\cup B$, $\\frac{a+b}{2} \\ge \\sqrt{ab}$)

[수행평가 일정 & 20점 배점 기준 (원고지 분량)]
- 1차시 계획서(10/27 화, 4점), 사전확인/e-book서약 마감(11/2 월), 2차시 보고서(11/3 화, 16점 - 전자기기 불가)
- 보고서 분량 기준: 1번 동기(200자 이상), 4번 과정 및 결과(500자 이상), 5번 성찰(200자 이상)
- 대필 엄격 금지: 완성된 보고서 문단을 대신 써주지 말고, 질문과 방향성 피드백만 제공할 것.

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

    const contents = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    if (ai) {
      try {
        // Use ThinkingLevel.LOW and maxOutputTokens for low latency & focused responses
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.6,
            topP: 0.9,
            maxOutputTokens: 1200,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });

        const replyText = response.text || '응답을 생성하지 못했습니다.';
        return res.json({ content: replyText });
      } catch (modelErr: any) {
        console.warn('Primary Gemini call failed, falling back to smart educational guide:', modelErr?.message || modelErr);
        const lastMsg = messages[messages.length - 1]?.content || '';
        const fallbackReply = generateSmartFallbackReply(lastMsg, inquiryType);
        return res.json({ content: fallbackReply });
      }
    } else {
      const lastMsg = messages[messages.length - 1]?.content || '';
      const fallbackReply = generateSmartFallbackReply(lastMsg, inquiryType);
      return res.json({ content: fallbackReply });
    }
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
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: '너는 개포고 1학년 공통수학2 수행평가 전문 멘토야. 대필하지 않고 학생이 직접 고쳐 쓰도록 피드백해.',
          temperature: 0.5,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        },
      });

      return res.json({ feedback: response.text });
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

// Smart fallback responder
function generateSmartFallbackReply(userMsg: string, inquiryType: string): string {
  const lower = userMsg.toLowerCase();

  if (
    lower.includes('써줘') ||
    lower.includes('작성해줘') ||
    lower.includes('대신') ||
    lower.includes('보고서 작성') ||
    lower.includes('초안 써')
  ) {
    return `안녕! 개포고 수행평가 원칙상 대필은 절대 할 수 없어! 😊

11월 3일(화) 2차시 보고서 작성 시간에는 **전자기기 사용이 완전히 금지**되기 때문에, 지금 내가 대신 써주면 실제 평가 시간에 너가 직접 글을 쓰지 못하게 된단다.

대신 원고지 200자/500자 분량을 어떻게 채우고, 어떤 수식과 책의 내용을 연결해야 20점 만점을 받을 수 있는지 항목별 질문과 힌트를 줄게! 너의 생각을 한 줄씩 들려줘볼래? ✨`;
  }

  if (inquiryType === 'review') {
    return `**[되돌아보기 탐구]**를 선택했구나! 수업 시간에 배운 개념을 깊이 있게 다시 다져보는 멋진 방향이야. 💡

고1 학생 눈높이에 꼭 맞고 쉽게 읽을 수 있는 추천 책과 발췌 포인트를 소개해 줄게:

1. [《세상을 바꾼 17가지 방정식》 (이언 스튜어트 / 사이언스북스)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%84%B8%EC%83%81%EC%9D%84+%EB%B0%94%EA%BF%94+17%EA%B0%80%EC%A7%80+%EB%B0%A9%EC%A0%95%EC%8B%9D)
   * **추천 발췌 부분**: 2장 '좌표기하학과 데카르트의 혁명' 챕터 (피타고라스 정리에서 시작해 좌표평면 위의 두 점 사이의 거리 공식과 직선/원의 방정식이 탄생한 배경 부분 발췌 추천!)
   * **연계 탐구**: "직선의 방정식은 왜 항상 $ax+by+c=0$ 꼴의 일차식일까?"

2. [《수학이 필요한 순간》 (김민형 / 인플루엔셜)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%88%98%ED%95%99%EC%9D%B4+%ED%95%84%EC%9A%94%ED%95%9C+%EC%88%9C%EA%B0%84)
   * **추천 발췌 부분**: 3장 '피타고라스 학파의 비밀과 무리수의 위기' (루트 2의 귀류법 증명 논리 발췌 추천!)
   * **연계 탐구**: 결론을 부정하여 모순을 이끌어내는 귀류법의 참된 의미를 명제 단원과 연결.

(※ e-book으로 읽을 경우 11월 2일 월요일까지 서약서 제출을 잊지 마!)
이 중 어떤 개념을 더 깊이 되짚어보고 싶니?`;
  } else {
    return `**[나아가기 탐구]**를 선택했구나! 배운 내용을 실생활이나 관심 분야로 넓혀보는 흥미진진한 도전이야. 🚀

고1 학생이 흥미롭게 읽을 수 있는 추천 책과 구체적인 발췌 포인트를 안내해 줄게:

1. [《택시 기하학》 (유진 F. 크라우스 / 경문사)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%ED%83%9D%EC%8B%9C+%EA%B8%B0%ED%95%98%ED%95%99)
   * **추천 발췌 부분**: 1장 '맨해튼 거리의 정의와 좌표평면' 및 3장 '택시 기하학에서의 원의 모양' 발췌 추천!
   * **연계 탐구**: 개포고 공식 예시인 "좌표평면의 거리를 $d=|x_1-x_2|+|y_1-y_2|$로 다르게 정의하면 원의 형태는 어떻게 될까?"

2. [《프로그래머, 수학으로 생각하라》 (유키 히로시 / 로드북)](https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%A8%B8+%EC%88%98%ED%95%99%EC%9C%BC%EB%A1%9C+%EC%83%9D%EA%B0%81%ED%95%98%EB%9D%BC)
   * **추천 발췌 부분**: 2장 '집합과 조건문, 드모르간의 법칙' 챕터 발췌 추천!
   * **연계 탐구**: 추천 알고리즘의 사용자 취향 유사도를 자카드 지수 $J(A, B) = \\frac{|A \\cap B|}{|A \\cup B|}$로 모델링.

(※ e-book으로 읽을 경우 11월 2일 월요일까지 서약서 제출 필수!)
어떤 진로나 주제에 더 관심이 가니?`;
  }
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
