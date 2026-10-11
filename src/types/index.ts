export type StepId = 0 | 1 | 2 | 3;

export type InquiryType = 'review' | 'extend'; // 되돌아보기 (1) | 나아가기 (2)

export interface MathUnit {
  id: string;
  category: '도형의 방정식' | '집합과 명제' | '함수와 그래프(연계)';
  title: string;
  subUnits: string[];
  keyConcepts: string[];
  achievementStandards: string[];
  reviewPoints: string[]; // 되돌아보기 탐구 포인트
  extendPoints: string[]; // 나아가기 탐구 포인트
}

export interface RecommendedBook {
  id: string;
  title: string;
  author: string;
  publisher: string;
  category: '자연과학/수학' | '컴퓨터/AI/데이터' | '경제/경영' | '생명/의학' | '인문/사회/논리' | '예술/디자인';
  units: string[];
  keywords: string[];
  summary: string;
  commonMath2Connection: string;
  purchaseUrl: string;
  hasEbook: boolean;
}

export interface OfficialRubricItem {
  section: string;
  maxScore: number;
  criteria: {
    category: string;
    condition: string;
    score: number;
  }[];
  tips: string;
}

export interface KnowledgeDocument {
  id: string;
  title: string;
  category: '수행평가매뉴얼' | '계획서양식' | '보고서양식' | '채점기준(루브릭)' | '교육과정' | '추천도서' | '우수예시' | '교과서/자료' | '사용자첨부';
  content: string;
  isActive: boolean;
  uploadedAt: string;
  fileSize?: string;
  fileType?: 'pdf' | 'image' | 'text' | 'document';
  previewUrl?: string; // Image base64 data URL or thumbnail preview
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  step?: StepId;
  suggestedQuestions?: string[];
  referenceLinks?: { title: string; url: string; note?: string }[];
}

// 1차시: 계획서 양식 (10월 27일 화요일 제출)
export interface PlanDraft {
  studentNumber: string;
  studentName: string;
  inquiryType: InquiryType; // 1. 되돌아보기 | 2. 나아가기
  topic: string; // 탐구 주제
  motivation: string; // 탐구 동기
  theoreticalBackground: string; // 2. 이론적 배경 (배움일지, 교과서 참고)
  bookTitle: string; // 3. 책 제목
  bookAuthorPublisher: string; // 저자 및 출판사
  bookUsageMethod: string; // 책 활용 방법 (책의 어떤 부분을 참고하여 어떻게 탐구할 것인지)
  additionalMethod: string; // 책 이외의 다른 추가 탐구 방법
  reportDesign: string; // 4. 탐구 보고서 설계 (내용 구성 미리 작성)
}

// 2차시: 보고서 양식 (11월 3일 화요일 작성, 전자기기 불가)
export interface ReportDraft {
  studentNumber: string;
  studentName: string;
  inquiryType: InquiryType;
  // 1. 탐구 주제와 탐구 동기 (3점: 주제적절성 1점, 탐구동기 1점, 분량 200자 1점)
  topic: string;
  motivation: string;
  // 2. 탐구 방법 (3점: 지참 1점, 방법 적절성 2점)
  bookTitle: string;
  bookAuthorPublisher: string;
  bookUsageMethod: string;
  additionalMethod: string;
  hasBookAndMaterialsReady: boolean;
  // 3. 이론적 배경 (2점: 교과내용 오류 없이 명확 2점)
  theoreticalBackground: string;
  // 4. 탐구 과정 및 결과 (6점: 수학적표현 1점, 탐구과정 1점, 결과유기적연결 3점, 분량 500자 1점)
  inquiryProcess: string;
  inquiryResult: string;
  visualMathNotes: string; // 그림, 복잡한 수식 등
  // 5. 탐구 성찰 (2점: 성찰 성실성 1점, 분량 200자 1점)
  reflection: string; // 탐구의 한계, 후속 탐구 의지, 느낀점 등
}
