import React from 'react';
import { BookOpen, FileText, Lock, Award, FileDown } from 'lucide-react';
import { InquiryType } from '../types/index.ts';

interface HeaderProps {
  currentTab: 'outline' | 'knowledge';
  setCurrentTab: (tab: 'outline' | 'knowledge') => void;
  inquiryType: InquiryType;
  knowledgeCount: number;
  onOpenRubric: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  inquiryType,
  knowledgeCount,
  onOpenRubric,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-3 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs shrink-0">
              <span className="text-sm tracking-tight">개포고</span>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  공통수학2 독서 탐구 작성기
                </h1>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  2026 공통수학2 수행평가
                </span>
                <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  총 20점 만점
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                독서와 함께하는 수학으로 확장하기 · 1차시 계획서(10/27) & 2차시 보고서(11/3) 작성 및 PDF 변환
              </p>
            </div>
          </div>

          {/* Quick Info & Indicators */}
          <div className="flex items-center gap-2 text-xs flex-wrap">
            {/* Inquiry Type Indicator */}
            <span
              className={`px-2.5 py-1 rounded-lg border font-medium ${
                inquiryType === 'review'
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'bg-indigo-50 text-indigo-800 border-indigo-200'
              }`}
            >
              {inquiryType === 'review' ? '1. 되돌아보기 탐구' : '2. 나아가기 탐구'}
            </span>

            {/* Rubric View Button */}
            <button
              onClick={onOpenRubric}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-200 transition-colors font-medium"
              title="상세 채점 기준표(20점 만점) 확인하기"
            >
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>공식 채점표 (20점)</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 py-2.5 overflow-x-auto scrollbar-none text-sm">
          <button
            onClick={() => setCurrentTab('outline')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              currentTab === 'outline'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>계획서 & 보고서 작성기 (PDF 변환)</span>
          </button>

          <button
            onClick={() => setCurrentTab('knowledge')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              currentTab === 'knowledge'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-4 h-4 text-amber-500" />
            <span>교과 지식창고</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                currentTab === 'knowledge'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {knowledgeCount}개 자료
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
