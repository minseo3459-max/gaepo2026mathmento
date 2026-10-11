import React from 'react';
import {
  Compass,
  BookOpen,
  GitBranch,
  FileCheck2,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Lightbulb,
  BookmarkCheck,
  ShieldCheck,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { InquiryType, StepId } from '../types/index.ts';
import { MATH_UNITS } from '../data/curriculumData.ts';

interface StepRoadmapProps {
  currentStep: StepId;
  setCurrentStep: (step: StepId) => void;
  inquiryType: InquiryType;
  setInquiryType: (type: InquiryType) => void;
  selectedUnit: string;
  setSelectedUnit: (unit: string) => void;
  onSendToChat: (prompt: string) => void;
  onNavigateToTab: (tab: 'chat' | 'roadmap' | 'outline' | 'knowledge') => void;
}

export const StepRoadmap: React.FC<StepRoadmapProps> = ({
  currentStep,
  setCurrentStep,
  inquiryType,
  setInquiryType,
  selectedUnit,
  setSelectedUnit,
  onSendToChat,
  onNavigateToTab,
}) => {
  const steps = [
    {
      id: 0 as StepId,
      name: 'Step 0',
      title: '탐구 방향 설정',
      desc: '되돌아보기 vs 나아가기 선택 & 공통수학2 소단원 개념 설정',
      icon: Compass,
    },
    {
      id: 1 as StepId,
      name: 'Step 1',
      title: '도서 및 주제 선정',
      desc: '필수 1권 도서 선정 (e-book 가능) & 공통수학2 2~3가지 연결 아이디어',
      icon: BookOpen,
    },
    {
      id: 2 as StepId,
      name: 'Step 2',
      title: '탐구 구체화 & 수학 연계',
      desc: '수학적 오류 방지, 추가 자료(11/2 확인) 수집 및 수식·그래프 모델링',
      icon: GitBranch,
    },
    {
      id: 3 as StepId,
      name: 'Step 3',
      title: '계획서·보고서 루브릭 점검',
      desc: '계획서(4점) 작성 및 보고서(16점, 200/500자 분량) 20점 만점 피드백',
      icon: FileCheck2,
    },
  ];

  const activeUnitObj = MATH_UNITS.find((u) => u.title === selectedUnit) || MATH_UNITS[0];

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Schedule Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-5 text-white shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
              2026 공통수학2 수행평가 공식 로드맵
            </span>
            <h2 className="text-base sm:text-lg font-bold mt-1">
              개포고등학교 '독서와 함께하는 수학으로 확장하기' (총 20점 만점)
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
              📅 1차시: 10/27(화) 계획서 (4점)
            </span>
            <span className="bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
              📅 2차시: 11/3(화) 보고서 (16점)
            </span>
          </div>
        </div>
      </div>

      {/* Stepper Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-600" />
              <span>단계별 탐구 가이드 로드맵</span>
            </h2>
            <p className="text-xs text-slate-500">
              공식 매뉴얼의 절차에 따라 순서대로 질문하고 계획서와 보고서를 빈틈없이 완성해보세요.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
            현재 진행: Step {currentStep}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((st) => {
            const Icon = st.icon;
            const isActive = currentStep === st.id;
            const isCompleted = currentStep > st.id;
            return (
              <button
                key={st.id}
                onClick={() => setCurrentStep(st.id)}
                className={`p-3.5 rounded-xl border text-left transition-all relative ${
                  isActive
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 shadow-xs'
                    : isCompleted
                    ? 'border-slate-200 bg-slate-50/70 hover:bg-slate-100'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {st.name}
                  </span>
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-blue-600'
                        : isCompleted
                        ? 'text-emerald-600'
                        : 'text-slate-400'
                    }`}
                  />
                </div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">{st.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{st.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 0 Content */}
      {currentStep === 0 && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  01
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  계획서 1번 필수 선택: 탐구 방향을 골라주세요
                </h3>
              </div>
              <span className="text-xs text-slate-400">1. 되돌아보기 or 2. 나아가기</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Review Option */}
              <div
                onClick={() => setInquiryType('review')}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  inquiryType === 'review'
                    ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-amber-900 flex items-center gap-1.5">
                    <BookmarkCheck className="w-4 h-4 text-amber-600" />
                    1. 되돌아보기 탐구
                  </span>
                  {inquiryType === 'review' && (
                    <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      선택됨
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  수업 시간에 학습한 내용 중 이해가 되지 않았던 부분이나 추가적으로 공부해보고 싶은 개념을 다시 학습하는 탐구
                </p>
                <div className="text-xs text-amber-900 bg-amber-100/60 p-3 rounded-lg space-y-1 border border-amber-200">
                  <div className="font-bold">📖 개포고 매뉴얼 공식 예시:</div>
                  <div className="italic font-medium">"직선의 방정식은 왜 항상 x, y에 대한 일차식으로만 나올까?"</div>
                  <div className="text-[11px] text-amber-800 mt-1">
                    * 점과 직선 사이의 거리 공식 유도, 원과 접선의 판별식 vs d=r 관계, 도형의 평행이동 부호의 비밀 등
                  </div>
                </div>
              </div>

              {/* Extend Option */}
              <div
                onClick={() => setInquiryType('extend')}
                className={`p-5 rounded-xl border cursor-pointer transition-all ${
                  inquiryType === 'extend'
                    ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-indigo-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    2. 나아가기 탐구
                  </span>
                  {inquiryType === 'extend' && (
                    <span className="text-xs font-semibold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded-full">
                      선택됨
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  수업 시간에 학습한 내용을 답습하지 않고 더 깊은 지식까지 학습해보거나 다른 분야의 사례와의 접점을 찾아 확장하는 탐구
                </p>
                <div className="text-xs text-indigo-900 bg-indigo-100/60 p-3 rounded-lg space-y-1 border border-indigo-200">
                  <div className="font-bold">🚀 개포고 매뉴얼 공식 예시:</div>
                  <div className="italic font-medium">"좌표평면에서 정의한 거리를 다른 공식으로 정의할 수는 없을까?"</div>
                  <div className="text-[11px] text-indigo-800 mt-1">
                    * 택시기하학(맨해튼 거리), OTT 추천 알고리즘과 집합의 자카드 유사도, 경제학 비용 최소화와 산술-기하 부등식
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Unit Picker */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  02
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  수행평가 범위 소단원을 선택하세요
                </h3>
              </div>
              <span className="text-xs text-blue-700 font-semibold">1. 도형의 방정식 ~ 2. 집합과 명제</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {MATH_UNITS.map((unit) => {
                const isSelected = selectedUnit === unit.title;
                return (
                  <button
                    key={unit.id}
                    onClick={() => setSelectedUnit(unit.title)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {unit.title}
                  </button>
                );
              })}
            </div>

            <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                    {activeUnitObj.category}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-1">{activeUnitObj.title}</h4>
                </div>
                <button
                  onClick={() =>
                    onSendToChat(
                      `개포고 수행평가 [${activeUnitObj.title}] 단원에서 ${
                        inquiryType === 'review' ? '되돌아보기' : '나아가기'
                      } 방향으로 추천할 만한 핵심 주제와 아이디어를 3가지 제안해줘!`
                    )
                  }
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>이 단원으로 멘토와 대화하기</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>핵심 개념 및 소단원</span>
                  </div>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    {activeUnitObj.keyConcepts.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200">
                  <div className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {inquiryType === 'review'
                        ? '되돌아보기 추천 착안점'
                        : '나아가기 추천 착안점'}
                    </span>
                  </div>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    {(inquiryType === 'review'
                      ? activeUnitObj.reviewPoints
                      : activeUnitObj.extendPoints
                    ).map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <span>다음 단계 (Step 1 도서 선정)로 이동</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 1 Content */}
      {currentStep === 1 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span>Step 1: 도서 및 주제 브레인스토밍 (반드시 책 1권 선정!)</span>
              </h3>
              <p className="text-xs text-slate-500">
                교과서 기반 탐구도 좋으나 반드시 책 한 권을 선정하여 탐구를 연결해야 합니다. (e-book 가능)
              </p>
            </div>
            <button
              onClick={() => {
                onNavigateToTab('chat');
                onSendToChat('고1 수준에 딱 맞고 쉽게 읽을 수 있는 추천 도서와 발췌 챕터, 그리고 링크를 추천해줘!');
              }}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold border border-blue-200 transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>멘토에게 도서 추천받기</span>
            </button>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>개포고 공식 매뉴얼 도서 선정 및 준비 필수 지침:</span>
            </div>
            <p>
              1. <strong>e-book 선정 학생:</strong> 11월 2일(월)까지 <strong>e-book 활용 서약서</strong>를
              작성하여 제출해야 합니다. (미제출 시 11월 3일 평가 당일 책을 지참하지 않은 것으로 간주되어 감점됩니다.)
            </p>
            <p>
              2. <strong>자연스러운 교과 연결:</strong> 진로를 억지로 끼워 맞추기보다, 선택한 책의 내용이
              공통수학2 교과 내용과 자연스럽고 유기적으로 맞닿도록 멘토와 브레인스토밍하세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <button
              onClick={() =>
                onSendToChat(
                  '《프로그래머, 수학으로 생각하라》를 읽고 공통수학2 집합과 명제 단원과 유기적으로 연결할 수 있는 계획서 3번(책 활용 방법) 아이디어를 알려줘!'
                )
              }
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 text-left transition-colors"
            >
              <div className="font-bold text-slate-900 mb-1">💻 컴퓨터 / AI 분야</div>
              <p className="text-slate-600">집합의 연산, 조건문과 진리집합, 드모르간 법칙, 자카드 지수</p>
            </button>

            <button
              onClick={() =>
                onSendToChat(
                  '《세상을 바꾼 17가지 방정식》이나 《수학이 필요한 순간》을 활용해 도형의 방정식(거리 공식, 직선/원)과 연결할 아이디어를 제안해줘!'
                )
              }
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 text-left transition-colors"
            >
              <div className="font-bold text-slate-900 mb-1">📐 순수 기하 / 해석기하</div>
              <p className="text-slate-600">직선의 일차식 필연성, 데카르트 좌표계의 탄생, 원과 접선</p>
            </button>

            <button
              onClick={() =>
                onSendToChat(
                  '《경제학 콘서트》나 《틀리지 않는 법》을 활용하여 공통수학2(직선 모델, 산술-기하평균 최적화)와 연계할 브레인스토밍을 도와줘!'
                )
              }
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/30 text-left transition-colors"
            >
              <div className="font-bold text-slate-900 mb-1">📈 경제 / 사회 / 의약학</div>
              <p className="text-slate-600">수요-공급 직선, 산술-기하 자원 배분, 바이러스 단면과 원의 방정식</p>
            </button>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(0)}
              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg"
            >
              이전 단계
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <span>다음 단계 (Step 2 탐구 구체화)로 이동</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2 Content */}
      {currentStep === 2 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-blue-600" />
                <span>Step 2: 탐구 구체화 & 수학적 연결 (감점 방지 모드)</span>
              </h3>
              <p className="text-xs text-slate-500">
                수집한 정보의 진위 판별과 수학적 오류 방지는 만점의 필수 조건입니다.
              </p>
            </div>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-rose-600" />
              <span>수학적 오류 감점 방지 점검</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-2">
              <div className="font-bold text-blue-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-600" />
                <span>보고서 4번 배점(6점) 만점 전략</span>
              </div>
              <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
                <li><strong>분량: 500자 이상</strong> 반드시 작성 (미만 시 1점 감점)</li>
                <li><strong>유기적 연결 (3점):</strong> 책의 내용과 공통수학2 개념을 필연적으로 결합</li>
                <li><strong>수학적 표현 (1점):</strong> 좌표 $(x, y)$, 기호 $\cup, \cap, \subset, \implies$, 수식 정확히 명기</li>
                <li><strong>하단 여백 활용:</strong> 복잡한 수식 유도나 그래프를 직접 그려 표현</li>
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-2">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>11월 2일(월) 사전 확인 마감 필수 체크</span>
              </div>
              <ul className="space-y-1.5 text-slate-700 list-disc list-inside">
                <li>보고서 작성 시 열람할 <strong>추가 조사 자료</strong>는 반드시 11/2(월)까지 사전 확인</li>
                <li>평가 당일(11/3) 가져오는 추가 조사 자료는 불인정</li>
                <li>e-book 구매자는 11/2(월)까지 활용 서약서 제출 완료</li>
                <li>11/3 보고서 작성 시간은 <strong>전자기기 일체 사용 불가</strong></li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg"
            >
              이전 단계
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <span>다음 단계 (Step 3 계획서·보고서 루브릭)로 이동</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3 Content */}
      {currentStep === 3 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-blue-600" />
                <span>Step 3: 공식 양식 작성 및 20점 만점 루브릭 점검</span>
              </h3>
              <p className="text-xs text-slate-500">
                1차시 계획서(4점)와 2차시 보고서(16점) 양식에 맞춰 작성하고 피드백을 받으세요.
              </p>
            </div>
            <button
              onClick={() => onNavigateToTab('outline')}
              className="px-3.5 py-1.5 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-xs font-bold transition-colors shadow-xs"
            >
              양식 작성 스튜디오로 이동
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="font-bold text-slate-800 block mb-1">동기 분량 기준</span>
              <p className="text-slate-600 leading-relaxed">
                원고지 300칸 중 <strong className="text-blue-700">200자 이상</strong> 작성 필수 (미만 시 0점)
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="font-bold text-slate-800 block mb-1">과정·결과 분량 기준</span>
              <p className="text-slate-600 leading-relaxed">
                원고지 600칸 중 <strong className="text-blue-700">500자 이상</strong> 작성 필수 (미만 시 0점)
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50">
              <span className="font-bold text-slate-800 block mb-1">성찰 분량 기준</span>
              <p className="text-slate-600 leading-relaxed">
                원고지 400칸 중 <strong className="text-blue-700">200자 이상</strong> 작성 필수 (한계/후속 연구)
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-lg"
            >
              이전 단계
            </button>
            <button
              onClick={() => onNavigateToTab('outline')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <span>계획서 & 보고서 작성하러 가기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
