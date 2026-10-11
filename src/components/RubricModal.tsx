import React from 'react';
import { X, Award, CheckCircle2, AlertTriangle, Calendar, BookOpen, AlertCircle } from 'lucide-react';
import { OFFICIAL_GAEPO_RUBRIC } from '../data/curriculumData.ts';

interface RubricModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RubricModal: React.FC<RubricModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                개포고 공통수학2 수행평가 공식 채점 기준표 (총 20점 만점)
              </h2>
              <p className="text-xs text-slate-500">
                1차시 계획서(4점) + 2차시 보고서(16점) = 합산 20점 만점 공식 루브릭
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs">
          {/* Important Timetable & Policy Notice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
              <div className="font-bold text-blue-950 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>1차시: 계획서 작성 (10월 27일 화요일) [4점]</span>
              </div>
              <ul className="text-blue-900 space-y-1 list-disc list-inside">
                <li>공통수학2(1. 도형의 방정식 ~ 2. 집합과 명제) 활용</li>
                <li><strong>전자기기 사용 가능</strong> (AI 멘토 및 인터넷 조사 활용)</li>
                <li>수업 시간 내 제출(2점) + 성실도(2점) = 4점 배점</li>
              </ul>
            </div>

            <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1.5">
              <div className="font-bold text-rose-950 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>2차시: 보고서 작성 (11월 3일 화요일) [16점]</span>
              </div>
              <ul className="text-rose-900 space-y-1 list-disc list-inside">
                <li><strong>전자기기 사용 절대 불가!</strong> (사전 준비 필수)</li>
                <li>선정한 책 및 사전 확인받은 추가 자료 지참 필수 (미지참 감점)</li>
                <li><strong>11월 2일(월)까지</strong> 추가자료 확인 및 e-book 서약서 제출 마감</li>
              </ul>
            </div>
          </div>

          {/* Word Count & Common Deductions Alert */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">원고지 글자 수(분량) 기준 미달 시 0점 주의!</span>
              <p className="mt-0.5 text-slate-700">
                1) 탐구 주제와 동기: <strong>200자 이상</strong> (미만 시 0점)<br />
                2) 탐구 과정 및 결과: <strong>500자 이상</strong> (미만 시 0점)<br />
                3) 탐구 성찰: <strong>200자 이상</strong> (미만 시 0점)<br />
                ※ 오류가 있는 정보를 포함하거나 수학적 오류 표현을 사용한 경우에도 감점됩니다.
              </p>
            </div>
          </div>

          {/* Detailed Rubric Sections */}
          <div className="space-y-4">
            {OFFICIAL_GAEPO_RUBRIC.map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-white shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2 border-b border-slate-100 gap-1">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">
                      {idx === 0 ? '계획' : idx}
                    </span>
                    {item.section}
                  </h3>
                  <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md border border-blue-100 text-xs">
                    배점 {item.maxScore}점
                  </span>
                </div>

                <p className="mt-2 text-slate-600 text-[11px] mb-3 leading-relaxed">
                  💡 <strong>작성 팁:</strong> {item.tips}
                </p>

                <div className="space-y-1.5">
                  {item.criteria.map((c, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-start justify-between gap-2"
                    >
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800">{c.category}</span>
                        <p className="text-slate-600 text-[11px]">{c.condition}</p>
                      </div>
                      <span className="font-bold text-blue-700 shrink-0">{c.score}점</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
