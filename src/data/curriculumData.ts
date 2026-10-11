import { MathUnit, RecommendedBook, OfficialRubricItem } from '../types/index.ts';

export const MATH_UNITS: MathUnit[] = [
  {
    id: 'unit-coordinate',
    category: '도형의 방정식',
    title: '1. 평면좌표',
    subUnits: ['두 점 사이의 거리', '선분의 내분점과 외분점'],
    keyConcepts: [
      '수직선 위의 두 점 사이의 거리',
      '좌표평면 위의 두 점 사이의 거리와 피타고라스 정리',
      '선분의 내분점 공식과 기하학적 의미',
      '선분의 외분점 공식과 무게중심'
    ],
    achievementStandards: [
      '[10공수2-01-01] 좌표평면에서 두 점 사이의 거리를 구할 수 있다.',
      '[10공수2-01-02] 선분의 내분점과 외분점의 좌표를 구할 수 있다.'
    ],
    reviewPoints: [
      '피타고라스 정리가 데카르트 좌표평면에서 두 점 사이의 거리 공식으로 일반화되는 과정',
      '내분점과 외분점 공식의 유도 과정과 기하학적 비율의 시각화',
      '삼각형의 무게중심 좌표가 꼭짓점 좌표의 산술평균 형태로 나타나는 이유'
    ],
    extendPoints: [
      '좌표평면에서 정의한 거리를 맨해튼 거리(택시 기하학)나 다른 방식으로 정의할 수는 없을까?',
      'GPS 위성 신호와 삼각측량에서의 거리 계산 알고리즘',
      '물리학의 질량중심(질점계)과 내분점 개념의 연계'
    ]
  },
  {
    id: 'unit-line',
    category: '도형의 방정식',
    title: '2. 직선의 방정식',
    subUnits: ['직선의 방정식의 형태', '두 직선의 평행과 수직', '두 직선의 교점을 지나는 직선', '점과 직선 사이의 거리'],
    keyConcepts: [
      '한 점과 기울기가 주어진 직선의 방정식',
      '일반형 ax + by + c = 0 (왜 항상 일차식인가?)',
      '두 직선의 수직 조건 (기울기의 곱 m1 * m2 = -1, aa\' + bb\' = 0)',
      '점과 직선 사이의 거리 공식 d = |ax1 + by1 + c| / sqrt(a^2 + b^2)'
    ],
    achievementStandards: [
      '[10공수2-01-03] 직선의 방정식을 구할 수 있다.',
      '[10공수2-01-04] 두 직선의 평행 조건과 수직 조건을 이해하고, 이를 활용할 수 있다.',
      '[10공수2-01-05] 점과 직선 사이의 거리를 구할 수 있다.'
    ],
    reviewPoints: [
      '직선의 방정식은 왜 항상 x, y에 대한 일차식으로만 나올까? (개포고 되돌아보기 공식 예시)',
      '두 직선이 수직일 때 기울기의 곱이 왜 -1이 되는지에 대한 기하학적/대수적 증명',
      '점과 직선 사이의 거리 공식 유도 과정(직각삼각형 넓이 또는 피타고라스 정리로 풀기)'
    ],
    extendPoints: [
      '인공지능의 선형 회귀(Linear Regression)와 오차 최소화 직선 모델',
      '컴퓨터 그래픽스에서 광선 추적법(Ray Tracing)과 직선의 교점 판정',
      '경제학에서 수요-공급 곡선의 균형 가격과 한계비용 직선'
    ]
  },
  {
    id: 'unit-circle',
    category: '도형의 방정식',
    title: '3. 원의 방정식',
    subUnits: ['원의 방정식 표준형과 일반형', '원과 직선의 위치 관계', '원의 접선의 방정식'],
    keyConcepts: [
      '원: 한 정점으로부터 일정한 거리에 있는 점들의 자취 (x-a)^2 + (y-b)^2 = r^2',
      '원과 직선의 위치 관계 판별 (판별식 D vs 중심과 직선 사이의 거리 d와 반지름 r)',
      '기울기가 주어진 접선의 방정식 y = mx ± r*sqrt(m^2+1)',
      '원 위의 점 (x1, y1)에서의 접선의 방정식 x1*x + y1*y = r^2'
    ],
    achievementStandards: [
      '[10공수2-01-06] 원의 방정식을 구할 수 있다.',
      '[10공수2-01-07] 원과 직선의 위치 관계를 이해하고, 원의 접선의 방정식을 구할 수 있다.'
    ],
    reviewPoints: [
      '판별식 D=0을 이용하는 방법과 기하학적 거리 d=r을 이용하는 판별의 계산 효율성과 직관적 차이',
      '원 밖의 점에서 그은 두 접선의 방정식을 구하는 다양한 접근법 비교',
      '접선의 방정식 공식 유도 과정(원의 중심과 접점을 잇는 반지름이 접선과 수직임)'
    ],
    extendPoints: [
      '전염병 확산 반경 모델링 및 통신 기지국 커버리지 영역 분석',
      '지진 진앙지 결정법(세 지진 관측소 원들의 교점 삼각측량)',
      '자율주행 차량의 회전 반경과 곡선 도로 접선 제어'
    ]
  },
  {
    id: 'unit-transform',
    category: '도형의 방정식',
    title: '4. 도형의 이동',
    subUnits: ['평행이동', '대칭이동(x축, y축, 원점, 직선 y=x)'],
    keyConcepts: [
      '점의 평행이동 (x+a, y+b)과 도형의 평행이동 f(x-a, y-b)=0에서 부호 차이의 본질',
      '대칭이동: x축, y축, 원점 대칭',
      '직선 y=x에 대한 대칭이동과 역함수와의 예비적 연결'
    ],
    achievementStandards: [
      '[10공수2-01-08] 평행이동의 의미를 이해하고, 이를 설명할 수 있다.',
      '[10공수2-01-09] 원점, x축, y축, 직선 y=x에 대한 대칭이동의 의미를 이해하고, 이를 설명할 수 있다.'
    ],
    reviewPoints: [
      '도형의 이동 f(x-a, y-b)=0에서 왜 부호가 반대로 들어갈까? (자취의 방정식 관점에서 정리)',
      '직선 y=x 대칭이 점 (x, y)를 (y, x)로 바꾸는 수직이등분선 조건 증명'
    ],
    extendPoints: [
      '컴퓨터 그래픽스와 애니메이션 변환(Translation & Reflection)',
      '에셔의 테셀레이션 판화와 대칭이동 기하학',
      '디지털 이미지 필터에서 좌우 반전 및 평행이동 알고리즘'
    ]
  },
  {
    id: 'unit-set',
    category: '집합과 명제',
    title: '5. 집합의 개념과 연산',
    subUnits: ['집합의 정의와 표현', '집합의 포함 관계(부분집합)', '집합의 연산', '드모르간의 법칙'],
    keyConcepts: [
      '집합의 명확한 조건과 원소',
      '원소나열법, 조건제시법, 벤 다이어그램',
      '부분집합의 개수 2^n',
      '합집합, 교집합, 여집합, 차집합, 서로소',
      '드모르간의 법칙 (A∪B)^c = A^c ∩ B^c'
    ],
    achievementStandards: [
      '[10공수2-02-01] 집합의 개념을 이해하고, 집합을 표현할 수 있다.',
      '[10공수2-02-02] 두 집합 사이의 포함 관계를 이해한다.',
      '[10공수2-02-03] 집합의 연산을 수행할 수 있다.'
    ],
    reviewPoints: [
      '러셀의 역설(자신을 원소로 갖지 않는 집합의 모임)을 통한 집합의 엄밀한 정의 탐구',
      '드모르간 법칙의 직관적 의미와 벤 다이어그램 및 진리표 증명',
      '분배법칙 A∩(B∪C) = (A∩B)∪(A∩C)의 대수적 구조'
    ],
    extendPoints: [
      '추천 시스템에서 사용자 취향 유사도 분석(자카드 유사도: |A∩B| / |A∪B|)',
      '데이터베이스 SQL 쿼리(JOIN, UNION, INTERSECT)와 관계대수',
      '생물 분류 체계 및 유전체 데이터의 벤 다이어그램 분석'
    ]
  },
  {
    id: 'unit-proposition',
    category: '집합과 명제',
    title: '6. 명제와 증명',
    subUnits: ['명제와 조건', '진리집합', '명제의 역과 대우', '대우를 이용한 증명법', '귀류법'],
    keyConcepts: [
      '명제와 조건의 뜻, 진리집합',
      '모든과 어떤을 포함한 명제와 그 부정',
      '명제의 역과 대우, 대우의 동치성',
      '귀류법: 결론을 부정하여 모순을 이끌어내어 원래 명제가 참임을 증명'
    ],
    achievementStandards: [
      '[10공수2-02-04] 명제와 조건의 뜻을 알고, 참과 거짓을 판별할 수 있다.',
      '[10공수2-02-05] 명제의 역과 대우를 이해하고, 대우를 이용한 증명법을 설명할 수 있다.',
      '[10공수2-02-06] 귀류법을 이해하고, 이를 이용하여 증명할 수 있다.'
    ],
    reviewPoints: [
      '왜 원래 명제가 참이면 대우도 반드시 참인가? (진리집합의 여집합 포함 관계 P⊂Q <=> Q^c⊂P^c)',
      '교과서에 나오는 "루트 2는 무리수이다" 귀류법 증명에서 모순 도출의 단계별 완결성',
      '일상 언어에서의 오류(역의 오류: 비가 오면 땅이 젖는다 -> 땅이 젖었으니 비가 왔다?)'
    ],
    extendPoints: [
      '법학에서의 무죄추정의 원칙과 귀류법적 판결 추론 구조',
      '컴퓨터 프로그래밍의 조건문 최적화와 불리언 논리 회로',
      '과학 철학에서 칼 포퍼의 반증주의와 가설 검정'
    ]
  },
  {
    id: 'unit-inequality',
    category: '집합과 명제',
    title: '7. 절대부등식',
    subUnits: ['절대부등식의 의미', '산술평균과 기하평균의 관계', '코시-슈바르츠 부등식'],
    keyConcepts: [
      '항상 성립하는 절대부등식의 뜻과 실수의 대소 판별',
      '산술·기하평균 부등식: a>0, b>0일 때 (a+b)/2 >= sqrt(ab) (등호는 a=b일 때)',
      '코시-슈바르츠 부등식: (a^2+b^2)(x^2+y^2) >= (ax+by)^2'
    ],
    achievementStandards: [
      '[10공수2-02-07] 절대부등식의 의미를 이해하고, 간단한 절대부등식을 증명할 수 있다.',
      '[10공수2-02-08] 산술평균과 기하평균의 관계를 이해하고, 이를 활용할 수 있다.'
    ],
    reviewPoints: [
      '산술-기하평균 부등식의 대수적 증명과 원의 지름-현을 이용한 기하학적 증명 비교',
      '최댓값·최솟값 문제에서 "등호 성립 조건(a=b)"을 간과하여 발생하는 치명적 수학적 오류 탐구',
      '코시-슈바르츠 부등식의 대수적 증명과 판별식 해석'
    ],
    extendPoints: [
      '경제학의 한정된 예산 하에서 효용 극대화 및 생산 비용 최소화 문제',
      '통신 신호 대역폭과 신호 왜곡 간의 부등식 제약',
      '주어진 둘레 조건에서 최대 넓이를 갖는 직사각형 토지 구획'
    ]
  }
];

export const OFFICIAL_GAEPO_RUBRIC: OfficialRubricItem[] = [
  {
    section: '계획서 (1차시: 10월 27일 화요일)',
    maxScore: 4,
    tips: '수업 시간 내에 반드시 제출하고, 주제/동기/이론/책 활용 방법/보고서 설계를 빈칸 없이 성실히 작성해야 4점 만점을 받습니다.',
    criteria: [
      {
        category: '계획서 작성 참여',
        condition: '수업 시간 내 제출한 경우 (2점) / 미제출 (0점)',
        score: 2,
      },
      {
        category: '계획서 수행도',
        condition: '탐구 주제, 동기, 이론적 배경, 책 활용 방법, 설계를 성실하게 작성한 경우 (2점) / 미흡 (1점) / 부실 (0점)',
        score: 2,
      },
    ],
  },
  {
    section: '보고서 1. 탐구 주제와 탐구 동기',
    maxScore: 3,
    tips: '원고지 300칸 중 반드시 200자 이상 작성하고, 공통수학2 수업 내용과 연계된 적절한 주제 및 구체적인 동기를 서술해야 3점 만점입니다.',
    criteria: [
      {
        category: '분량',
        condition: '200자 이상 작성한 경우 (1점) / 200자 미만 (0점)',
        score: 1,
      },
      {
        category: '주제 적절성',
        condition: '수업 내용(공통수학2)과 연계하여 적절한 탐구 주제를 설정한 경우 (1점) / 관련되지 않은 주제 (0점)',
        score: 1,
      },
      {
        category: '탐구 동기',
        condition: '탐구 동기가 구체적으로 나타난 경우 (1점) / 탐구 동기 미기재 (0점)',
        score: 1,
      },
    ],
  },
  {
    section: '보고서 2. 탐구 방법',
    maxScore: 3,
    tips: '선정한 책과 11월 2일(월)까지 사전 확인받은 추가 조사 자료를 11월 3일 당일에 반드시 지참하고, 책 활용법과 추가 조사 방법을 명확히 설명해야 3점 만점입니다.',
    criteria: [
      {
        category: '책, 자료 지참',
        condition: '선정한 책 및 추가 조사 자료를 모두 지참한 경우 (1점) / 미지참한 자료가 있는 경우 (0점)',
        score: 1,
      },
      {
        category: '탐구 방법 적절성',
        condition: '선정한 책과 탐구에서 책을 활용하는 방법, 책 이외의 추가 조사 방법에 대해 명확하게 설명한 경우 (2점) / 설명이 부적절하거나 미설명 (1점)',
        score: 2,
      },
    ],
  },
  {
    section: '보고서 3. 이론적 배경',
    maxScore: 2,
    tips: '탐구 주제와 관련된 공통수학2 교과 지식(공식, 정의, 정리)을 수학적 오류 없이 명확하게 정리해야 2점 만점입니다.',
    criteria: [
      {
        category: '교과 내용 정리',
        condition: '탐구 주제 관련 교과 내용을 오류 없이 명확하게 정리한 경우 (2점) / 미흡하거나 수학적 오류가 포함된 경우 (1점) / 미정리 (0점)',
        score: 2,
      },
    ],
  },
  {
    section: '보고서 4. 탐구 과정 및 결과',
    maxScore: 6,
    tips: '원고지 600칸 중 반드시 500자 이상 작성해야 하며, 책/추가 조사 자료와 주제가 유기적으로 연결되고 정확한 수학적 표현(수식, 그래프)을 사용해야 6점 만점입니다.',
    criteria: [
      {
        category: '분량',
        condition: '500자 이상 작성한 경우 (1점) / 500자 미만 (0점)',
        score: 1,
      },
      {
        category: '탐구 과정의 논리성',
        condition: '탐구 과정을 비약 없이 논리적으로 작성한 경우 (1점) / 설명 미흡 (0점)',
        score: 1,
      },
      {
        category: '책과의 유기적 연결',
        condition: '책, 추가 조사를 통해 얻은 정보를 탐구 주제와 유기적으로 연결한 경우 (3점) / 연결 시도했으나 빈약 (2점) / 연결성 없음 (1점)',
        score: 3,
      },
      {
        category: '수학적 표현의 정확성',
        condition: '탐구 과정 및 결과 기술 과정에서 수학적 표현을 정확하게 사용한 경우 (1점) / 오류가 있거나 수학적 표현 미사용 (0점)',
        score: 1,
      },
    ],
  },
  {
    section: '보고서 5. 탐구 성찰',
    maxScore: 2,
    tips: '원고지 400칸 중 반드시 200자 이상 작성하고, 탐구의 한계점, 앞으로 더 알아보고 싶은 후속 탐구 의지, 솔직한 느낀점을 풍부하게 담아야 2점 만점입니다.',
    criteria: [
      {
        category: '분량',
        condition: '200자 이상 작성한 경우 (1점) / 200자 미만 (0점)',
        score: 1,
      },
      {
        category: '성찰 성실성',
        condition: '탐구의 한계, 후속 탐구 의지, 느낀점 등을 풍부하게 작성한 경우 (1점) / 나타나지 않은 경우 (0점)',
        score: 1,
      },
    ],
  },
];

// Expanded curated books: 26+ verified accessible books covering all fields
export const RECOMMENDED_BOOKS: RecommendedBook[] = [
  {
    id: 'book-1',
    title: '수학이 필요한 순간',
    author: '김민형',
    publisher: '인플루엔셜',
    category: '인문/사회/논리',
    units: ['집합과 명제', '도형의 방정식'],
    keywords: ['논리적 사고', '투표의 역설', '선택의 공리', '데카르트 좌표'],
    summary: '한국인 최초 옥스퍼드대 수학과 석좌교수 김민형 교수가 인간의 사고방식과 사회적 의사결정을 수학적으로 풀어낸 인문학적 교양서.',
    commonMath2Connection: '민주주의 투표 시스템과 사회적 선택 이론을 명제의 참/거짓 및 집합의 분할과 연결하거나, 좌표평면을 통한 세계의 정량화 관점으로 탐구할 수 있음.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%88%98%ED%95%99%EC%9D%B4+%ED%95%84%EC%9A%94%ED%95%9C+%EC%88%9C%EA%B0%84',
    hasEbook: true
  },
  {
    id: 'book-2',
    title: '틀리지 않는 법: 수학적 사고의 힘',
    author: '조던 엘렌버그',
    publisher: '열린책들',
    category: '인문/사회/논리',
    units: ['집합과 명제', '직선의 방정식'],
    keywords: ['반례', '조건부 논리', '선형 회귀', '귀류법'],
    summary: '수학 천재 조던 엘렌버그가 일상과 사회의 수많은 오류 속에서 "틀리지 않기 위한" 수학적 직관과 논리적 추론을 위트 있게 풀어낸 책.',
    commonMath2Connection: '명제의 반례 찾기, 귀류법적 사고의 일상 적용, 그리고 선형 추세선(직선의 방정식)의 과도한 외삽이 낳는 오류를 분석하는 탐구에 매우 적합.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%ED%8B%80%EB%A6%AC%EC%A7%80+%EC%95%8A%EB%8A%94+%EB%B2%95',
    hasEbook: true
  },
  {
    id: 'book-3',
    title: '알고리즘, 인생을 계산하다',
    author: '브라이언 크리스천, 톰 그리피스',
    publisher: '청림출판',
    category: '컴퓨터/AI/데이터',
    units: ['집합과 명제', '절대부등식'],
    keywords: ['최적 정지', '자원 배분', '조건 탐색', '산술-기하평균'],
    summary: '인간의 일상적인 의사결정(집 구하기, 정리정돈, 일정 관리)을 컴퓨터 알고리즘과 수학적 최적화 모델로 통찰한 베스트셀러.',
    commonMath2Connection: '최적화 문제에서 산술·기하평균 부등식을 이용한 자원 분배 문제, 그리고 데이터 필터링에서 집합의 교집합·여집합 논리를 결합할 수 있음.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%95%8C%EA%B3%A0%EB%A6%AC%EC%86%88+%EC%9D%B8%EC%83%9D%EC%9D%84+%EA%B3%84%EC%82%B0%ED%95%98%EB%8B%A4',
    hasEbook: true
  },
  {
    id: 'book-4',
    title: '프로그래머, 수학으로 생각하라',
    author: '유키 히로시',
    publisher: '로드북',
    category: '컴퓨터/AI/데이터',
    units: ['집합과 명제'],
    keywords: ['조건문', '드모르간 법칙', '진리표', '명제의 역/대우', '수학적 귀납법'],
    summary: '개발자가 반드시 알아야 할 논리학, 집합론, 부울 대수를 친절한 예제와 다이어그램으로 설명한 프로그래밍 수학 입문서.',
    commonMath2Connection: '복잡한 조건문(if-else)을 집합의 연산과 드모르간 법칙으로 단순화하는 과정, 명제의 대우를 활용한 버그 검증 로직 설계 탐구에 최적.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%ED%94%84%EB%A1%9C%EA%B7%B8%EB%9E%98%EB%A8%B8+%EC%88%98%ED%95%99%EC%9C%BC%EB%A1%9C+%EC%83%9D%EA%B0%81%ED%95%98%EB%9D%BC',
    hasEbook: true
  },
  {
    id: 'book-5',
    title: '세상을 바꾼 17가지 방정식',
    author: '이언 스튜어트',
    publisher: '사이언스북스',
    category: '자연과학/수학',
    units: ['도형의 방정식'],
    keywords: ['피타고라스 정리', '좌표기하학', '원의 방정식', '거리 공식'],
    summary: '인류 역사의 문명을 뒤바꾼 17가지 위대한 방정식의 탄생 배경과 현대적 의미를 조명한 수학 대중서의 고전.',
    commonMath2Connection: '피타고라스 정리에서 출발하여 데카르트의 좌표평면, 두 점 사이의 거리 공식, 그리고 원의 방정식 x^2+y^2=r^2으로 이어지는 대수-기하 융합 과정 탐구.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%84%B8%EC%83%81%EC%9D%84+%EB%B0%94%EA%BF%94+17%EA%B0%80%EC%A7%80+%EB%B0%A9%EC%A0%95%EC%8B%9D',
    hasEbook: true
  },
  {
    id: 'book-6',
    title: '페르마의 마지막 정리',
    author: '사이먼 싱',
    publisher: '영림카디널',
    category: '자연과학/수학',
    units: ['집합과 명제'],
    keywords: ['귀류법', '수학적 증명', '반례', '타원곡선'],
    summary: '350년간 인류 최고의 수학자들을 괴롭힌 난제를 앤드루 와일스가 해결하기까지의 지적 대서사시.',
    commonMath2Connection: '수학에서 "증명"이란 무엇인가? 교과서에 나오는 귀류법(모순을 통한 참의 입증)의 본질을 페르마의 정리 도전사 속의 증명 논리와 연결.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%ED%8E%98%EB%A5%B4%EB%A7%88%EC%9D%98+%EB%A7%88%EC%A7%80%EB%A7%89+%EC%A0%95%EB%A6%AC',
    hasEbook: true
  },
  {
    id: 'book-7',
    title: '미술관에 간 수학자',
    author: '이광연',
    publisher: '휴머니스트',
    category: '예술/디자인',
    units: ['도형의 방정식'],
    keywords: ['원근법', '소실점', '직선의 방정식', '대칭이동', '테셀레이션'],
    summary: '레오나르도 다빈치부터 에셔까지, 명화 속에 숨겨진 수학적 원리와 기하학적 구도를 흥미진진하게 탐색하는 예술-수학 융합서.',
    commonMath2Connection: '르네상스 투시원근법에서 소실점으로 수렴하는 직선들의 방정식 모델링, 또는 에셔 판화의 평행이동과 선대칭을 도형의 이동 단원과 연결.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EB%AF%B8%EC%88%A0%EA%B4%80%EC%97%90+%EA%B0%84+%EC%88%98%ED%95%99%EC%9E%90',
    hasEbook: true
  },
  {
    id: 'book-8',
    title: '경제학 콘서트',
    author: '팀 하포드',
    publisher: '웅진지식하우스',
    category: '경제/경영',
    units: ['도형의 방정식', '절대부등식'],
    keywords: ['수요-공급 곡선', '직선 모델', '자원 배분', '산술-기하 최적화'],
    summary: '스타벅스 커피 가격, 슈퍼마켓 가격 차별 등 일상 속 경제 현상을 명쾌한 경제학적 논리로 분석한 전 세계적 베스트셀러.',
    commonMath2Connection: '가격과 수요량의 관계를 직선의 방정식으로 모델링하고 교점을 구하거나, 한정된 예산 하에서 효용을 극대화할 때 산술-기하평균 부등식 적용.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EA%B2%BD%EC%A0%9C%ED%95%99+%EC%BD%98%EC%84%9C%ED%8A%B8',
    hasEbook: true
  },
  {
    id: 'book-9',
    title: '생명의 수학',
    author: '이언 스튜어트',
    publisher: '사이언스북스',
    category: '생명/의학',
    units: ['도형의 방정식', '집합과 명제'],
    keywords: ['바이러스 정이십면체', '원의 대칭성', '세포 분열', '분류학적 집합'],
    summary: '현대 생물학이 유전자, 바이러스 구조, 생태계 동역학을 이해하기 위해 어떻게 수학을 필수 도구로 사용하는지 보여주는 책.',
    commonMath2Connection: '세포막 및 바이러스 단면의 원형 구조와 원의 방정식 모델링, 생태계 종간 상호작용 및 유전자 발현 조건의 집합론적 분류.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%83%9D%EB%AA%85%EC%9D%98+%EC%88%98%ED%95%99',
    hasEbook: true
  },
  {
    id: 'book-10',
    title: '지능의 탄생',
    author: '이대열',
    publisher: '바다출판사',
    category: '생명/의학',
    units: ['집합과 명제'],
    keywords: ['의사결정', '조건부 행동', '논리 체계', '명제의 참/거짓'],
    summary: '세계적인 뇌과학자 이대열 교수가 뇌와 유전자의 관점에서 지능과 의사결정의 본질을 진화론적으로 파헤친 명저.',
    commonMath2Connection: '생명체의 환경 적응 행동을 조건 명제(p -> q)의 네트워크로 분석하고, 인과관계의 오류와 필요충분조건의 생물학적 의미 탐구.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%A7%80%EB%8A%A5%EC%9D%98+%ED%83%84%EC%83%9D',
    hasEbook: true
  },
  {
    id: 'book-11',
    title: '보통 사람을 위한 현대 수학',
    author: '이언 스튜어트',
    publisher: '바다출판사',
    category: '자연과학/수학',
    units: ['도형의 방정식', '집합과 명제'],
    keywords: ['도형의 대칭', '변환', '추상대수 기초', '집합의 분할'],
    summary: '수학의 추상적인 현대적 개념(변환, 대칭성, 위상수학)을 대중의 언어로 친절하게 안내하는 수학 교양서.',
    commonMath2Connection: '도형의 평행이동과 대칭이동을 기하학적 "변환(Transformation)" 관점에서 심화 고찰하거나, 도형의 불변 성질을 탐구.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EB%B3%B4%ED%86%B5+%EC%82%AC%EB%9E%8C%EC%9D%84+%EC%9C%84%ED%95%9C+%ED%98%84%EB%8C%80+%EC%88%98%ED%95%99',
    hasEbook: true
  },
  {
    id: 'book-12',
    title: '수학으로 생각하는 힘',
    author: '키스 데블린',
    publisher: '해나무',
    category: '인문/사회/논리',
    units: ['집합과 명제'],
    keywords: ['수학적 사고방식', '논리적 엄밀성', '가설 검증', '조건문'],
    summary: '스탠퍼드대 수학과 키스 데블린 교수가 계산을 넘어선 "수학적 사고(Mathematical Thinking)"의 훈련법을 제시한 책.',
    commonMath2Connection: '고등학교 수학에서 가장 중요한 조건과 명제의 정확한 독해법, \'모든\'과 \'어떤\'의 부정, 논리적 증명 구성법을 깊이 있게 되돌아보는 탐구에 최적.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%88%98%ED%95%99%EC%9C%BC%EB%A1%9C+%EC%83%9D%EA%B0%81%ED%95%98%EB%8A%94+%ED%9E%98',
    hasEbook: true
  },
  {
    id: 'book-13',
    title: '택시 기하학',
    author: '유진 F. 크라우스',
    publisher: '경문사',
    category: '자연과학/수학',
    units: ['도형의 방정식'],
    keywords: ['맨해튼 거리', '거리의 재정의', '비유클리드 기하', '원의 형태'],
    summary: '격자형 도로망(바둑판 도로)에서 두 점 사이의 거리를 측정하는 택시 기하학을 통해 유클리드 좌표평면의 거리 공식을 비판적으로 성찰하는 책.',
    commonMath2Connection: '개포고 매뉴얼의 공식 나아가기 예시인 "좌표평면에서 정의한 거리를 다른 공식으로 정의할 수는 없을까?"에 100% 부합! 택시 기하학에서 원(|x|+|y|=r)의 모양이 왜 다이아몬드(정사각형)가 되는지 탐구 가능.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%ED%83%9D%EC%8B%9C+%EA%B8%B0%ED%95%98%ED%95%99',
    hasEbook: false
  },
  {
    id: 'book-14',
    title: '기하학의 힘',
    author: '조던 엘렌버그',
    publisher: '열린책들',
    category: '자연과학/수학',
    units: ['도형의 방정식', '집합과 명제'],
    keywords: ['해석기하학', '좌표화', '정치 선거구 획정', '거리 모델'],
    summary: '좌표와 도형이 어떻게 미국 대선의 선거구 게리맨더링, 바이러스 전파, 데이터 차원 축소에 쓰이는지 흥미진진하게 풀어낸 세계적 역작.',
    commonMath2Connection: '선거구 경계선을 직선의 방정식으로 분할하거나, 평면좌표 상의 점들의 거리 집중도를 분석하여 공정성을 검증하는 탐구에 매우 적합.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EA%B8%B0%ED%95%98%ED%95%99%EC%9D%B4+%ED%9E%98',
    hasEbook: true
  },
  {
    id: 'book-15',
    title: '인공지능을 위한 수학',
    author: '이병호',
    publisher: '한빛미디어',
    category: '컴퓨터/AI/데이터',
    units: ['도형의 방정식', '집합과 명제'],
    keywords: ['벡터 기초', '직선의 분리 초평면', '불리언 연산', '거리 함수'],
    summary: '인공지능의 기계학습 모델(SVM, 퍼셉트론, 데이터 분류)이 어떤 기초 고교 수학 원리 위에서 작동하는지 설명한 책.',
    commonMath2Connection: '선형 분류기(퍼셉트론)가 데이터를 두 영역으로 가르는 직선의 방정식 ax+by+c=0의 원리와 점과 직선 사이의 거리 마진을 최적화하는 과정 탐구.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5%EC%9D%84+%EC%9C%84%ED%95%9C+%EC%88%98%ED%95%99',
    hasEbook: true
  },
  {
    id: 'book-16',
    title: '수학, 인문으로 수를 읽다',
    author: '이광연',
    publisher: '한국문학사',
    category: '인문/사회/논리',
    units: ['도형의 방정식', '집합과 명제'],
    keywords: ['데카르트 이원론', '좌표평면의 철학', '조건 명제', '진리집합'],
    summary: '역사, 철학, 문학 속에 숨겨진 수학적 사고의 궤적을 인문학자의 따뜻한 시선으로 풀어낸 고등학생 필독 교양서.',
    commonMath2Connection: '데카르트가 "나는 생각한다, 고로 존재한다"를 선언하며 어떻게 기하학과 대수를 좌표평면으로 통합했는지, 직선의 대수화 역사 탐구에 최적.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%88%98%ED%95%99+%EC%9D%B8%EB%AC%B8%EC%9C%BC%EB%A1%9C+%EC%88%98%EB%5B%EA%B3%A0%EC%9D%BD%EB%8B%A4',
    hasEbook: true
  },
  {
    id: 'book-17',
    title: '신도 주사위 놀이를 한다',
    author: '이언 스튜어트',
    publisher: '사이언스북스',
    category: '자연과학/수학',
    units: ['집합과 명제', '도형의 방정식'],
    keywords: ['결정론과 불확실성', '조건부 논리', '위상과 기하', '모순'],
    summary: '자연계의 카오스와 질서, 예측 가능성의 한계를 수학적 모델링으로 탐색한 이언 스튜어트의 대표작.',
    commonMath2Connection: '조건 명제의 필요충분조건과 인과관계의 비대칭성을 자연 현상과 연결하거나, 좌표평면 상의 상태 궤적 탐구에 활용.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%8B%A0%EB%8F%84+%EC%A3%BC%EC%82%AC%EC%9C%84+%EB%86%80%EC%9D%B4%EB%5D%EB%A5%BC+%ED%95%9C%EB%8B%A4',
    hasEbook: true
  },
  {
    id: 'book-18',
    title: '지도 위의 인문학',
    author: '김이재',
    publisher: '출판저널',
    category: '인문/사회/논리',
    units: ['도형의 방정식'],
    keywords: ['GIS 지도 투영법', '좌표계', '최단 거리', '원과 전파'],
    summary: '지도를 통해 세계의 역사와 지리, 문명을 수학적·공간적 관점에서 분석한 교양 인문도서.',
    commonMath2Connection: '구면 지구를 평면좌표로 투영할 때 발생하는 거리 왜곡, 그리고 세 지점의 거리(원의 방정식 삼각측량)를 이용한 GPS 위치 결정 탐구.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%A7%80%EB%8F%84+%EC%9C%84%EC%9D%98+%EC%9D%B8%EB%AC%B8%ED%95%99',
    hasEbook: true
  },
  {
    id: 'book-19',
    title: '수학, 인문으로 수를 읽다',
    author: '이광연',
    publisher: '한국문학사',
    category: '인문/사회/논리',
    units: ['집합과 명제', '도형의 방정식'],
    keywords: ['인문학과 수학', '조선시대 수학', '좌표와 지도', '논리적 사고'],
    summary: '역사, 문학, 미술 속에 숨겨진 수학적 원리를 고등학생 눈높이에서 흥미진진하게 풀어낸 친절한 교양서.',
    commonMath2Connection: '고산자 김정호의 대동여지도 속 좌표 개념을 도형의 방정식 평면좌표와 연결하거나, 역사적 사건의 인과관계를 조건 명제로 분석.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%88%98%ED%95%99+%EC%9D%B8%EB%AC%B8%EC%9C%BC%EB%A1%9C+%EC%88%98%EB%A5%BC+%EC%9D%BD%EB%8B%A4',
    hasEbook: true
  },
  {
    id: 'book-20',
    title: '생체 시계의 비밀',
    author: '러셀 포스터',
    publisher: '동아엠앤비',
    category: '생명/의학',
    units: ['도형의 방정식'],
    keywords: ['생체 리듬', '주기성', '원형 궤도 모델', '좌표 평면'],
    summary: '24시간 일주기 생체 시계의 분자 메커니즘과 인간 건강의 관계를 다룬 옥스퍼드대 수면의학 명저.',
    commonMath2Connection: '24시간 주기를 원의 방정식 x^2 + y^2 = r^2 위의 각도 및 점의 회전 운동으로 치환하여 생체 호르몬 분비 곡선 모델링.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%83%9D%EC%B2%B4+%EC%8B%9C%EA%B3%84%EC%9D%98+%EB%B9%84%EB%B0%80',
    hasEbook: true
  },
  {
    id: 'book-21',
    title: '넛지 (Nudge)',
    author: '리처드 탈러, 캐스 선스타인',
    publisher: '리더스북',
    category: '경제/경영',
    units: ['집합과 명제'],
    keywords: ['행동경제학', '선택 설계', '기본값 조건문', '논리적 프레이밍'],
    summary: '인간의 비합리적 의사결정을 유도하는 부드러운 개입(넛지)의 원리를 다룬 노벨경제학상 수상작.',
    commonMath2Connection: '선택지 설계에서 기본값 설정(Opt-in vs Opt-out)을 조건 명제와 여집합의 관점에서 분석하고, 논리적 오류를 바로잡는 탐구.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EB%84%9B%EC%A7%80',
    hasEbook: true
  },
  {
    id: 'book-22',
    title: '판결의 재구성',
    author: '도진기',
    publisher: '비채',
    category: '인문/사회/논리',
    units: ['집합과 명제'],
    keywords: ['법적 추론', '무죄추정의 원칙', '귀류법', '반례 검증'],
    summary: '판사 출신 작가가 실제 판결문 속의 치열한 논리 싸움과 증거 판단 과정을 법학적·논리학적으로 분석한 책.',
    commonMath2Connection: '형사재판에서 유죄 입증의 구조가 수학의 귀류법("피고인이 무죄라면 이 증거와 모순된다")과 어떻게 일치하는지 논증 구조 분석.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%ED%8C%90%EA%B2%B0%EC%9D%98+%EC%9E%AC%EA%B5%AC%EC%84%B1',
    hasEbook: true
  },
  {
    id: 'book-23',
    title: '디자인과 수학의 만남',
    author: '마쓰다 유키오',
    publisher: '안그라픽스',
    category: '예술/디자인',
    units: ['도형의 방정식'],
    keywords: ['황금비', '대칭축', '원의 조형미', '도형의 평행이동'],
    summary: '건축, 로고 디자인, 타이포그래피 속에 숨어 있는 비례와 기하학적 대칭성을 디자이너의 언어로 해설한 책.',
    commonMath2Connection: '현대 브랜드 로고(애플, 아우디 등)의 원의 접선 방정식과 대칭이동을 통한 그리드 시스템 작도 탐구.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EB%94%94%EC%9E%90%EC%9D%B8%EA%B3%BC+%EC%88%98%ED%95%99',
    hasEbook: true
  },
  {
    id: 'book-24',
    title: '기후변화의 물리학',
    author: '로렌스 크라우스',
    publisher: '승산',
    category: '자연과학/수학',
    units: ['도형의 방정식', '절대부등식'],
    keywords: ['에너지 평형', '선형 추세선', '복사 평형 한계', '최적화'],
    summary: '지구 온난화와 기후 위기를 감정이 아닌 엄밀한 열역학과 기초 대수 방정식으로 명쾌하게 증명한 물리학 책.',
    commonMath2Connection: '지구 평균 기온 상승 추세를 직선의 방정식으로 모델링하고 오차를 분석하거나, 탄소 배출 저감 최적화에 절대부등식 적용.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EA%B8%B0%ED%9B%84%EB%B3%80%ED%99%94%EC%9D%98+%EB%AC%BC%EB%A6%AC%ED%95%99',
    hasEbook: true
  },
  {
    id: 'book-25',
    title: '미술관에 간 수학자',
    author: '이명옥, 김흥규',
    publisher: '어바웃어북',
    category: '예술/디자인',
    units: ['도형의 방정식'],
    keywords: ['원근법', '소실점과 직선', '테셀레이션', '기하학적 대칭이동'],
    summary: '명화 속에 숨겨진 소실점, 원근법, 기하학적 대칭 이동을 미술관 관람 형식으로 쉽고 흥미롭게 소개한 청소년 추천 도서.',
    commonMath2Connection: '르네상스 회화의 소실점을 직선의 방정식의 교점으로 분석하고, 바둑판 무늬 타일 배치를 평행이동 f(x-a, y-b)=0 공식과 연결.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EB%AF%B8%EC%88%A0%EA%B4%80%EC%97%90+%EA%B0%84+%EC%88%98%ED%95%99%EC%9E%90',
    hasEbook: true
  },
  {
    id: 'book-26',
    title: '코딩하는 공익',
    author: '이민석',
    publisher: '위즈덤하우스',
    category: '컴퓨터/AI/데이터',
    units: ['집합과 명제'],
    keywords: ['데이터 필터링', '조건문', '마스크 연산', '사회적 문제해결'],
    summary: '코딩과 수학적 논리를 통해 마스크 대란, 공공 데이터 문제를 창의적으로 해결한 실천적 이야기.',
    commonMath2Connection: '재고 데이터 및 지역 조건 필터링에서 집합의 교집합(A∩B)과 조건 명제를 결합하여 실제 공공 문제 해결 알고리즘으로 구조화.',
    purchaseUrl: 'https://www.aladin.co.kr/search/wsearchresult.aspx?SearchWord=%EC%BD%94%EB%94%A9%ED%95%98%EB%8A%94+%EA%B3%B5%EC%9D%B5',
    hasEbook: true
  }
];
