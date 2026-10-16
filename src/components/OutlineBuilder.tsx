import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  Award,
  CheckCircle2,
  Calendar,
  BookOpen,
  Info,
  HelpCircle,
  FileDown,
  RotateCcw,
} from 'lucide-react';
import { InquiryType, PlanDraft, ReportDraft } from '../types/index.ts';
import { PdfExportModal } from './PdfExportModal.tsx';

interface OutlineBuilderProps {
  plan: PlanDraft;
  setPlan: React.Dispatch<React.SetStateAction<PlanDraft>>;
  report: ReportDraft;
  setReport: React.Dispatch<React.SetStateAction<ReportDraft>>;
  onEvaluateDraft: (type: 'plan' | 'report', data: any) => Promise<string>;
  onOpenRubric: () => void;
}

export const OutlineBuilder: React.FC<OutlineBuilderProps> = ({
  plan,
  setPlan,
  report,
  setReport,
  onEvaluateDraft,
  onOpenRubric,
}) => {
  const [activeFormTab, setActiveFormTab] = useState<'plan' | 'report'>('plan');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const handlePlanChange = (field: keyof PlanDraft, value: any) => {
    setPlan((prev) => ({ ...prev, [field]: value }));
  };

  const handleReportChange = (field: keyof ReportDraft, value: any) => {
    setReport((prev) => ({ ...prev, [field]: value }));
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const result = await onEvaluateDraft(
        activeFormTab,
        activeFormTab === 'plan' ? plan : report
      );
      setFeedback(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Sync plan into report
  const handleSyncPlanToReport = () => {
    setReport((prev) => ({
      ...prev,
      inquiryType: plan.inquiryType,
      topic: plan.topic,
      motivation: plan.motivation,
      theoreticalBackground: plan.theoreticalBackground,
      bookTitle: plan.bookTitle,
      bookAuthorPublisher: plan.bookAuthorPublisher,
      bookUsageMethod: plan.bookUsageMethod,
      additionalMethod: plan.additionalMethod,
    }));
    setActiveFormTab('report');
  };

  const handleCopyMarkdown = () => {
    let text = '';
    if (activeFormTab === 'plan') {
      text = `# 2026학년도 2학기 공통수학2 수행평가 계획서
- 학번: ${plan.studentNumber || '______'} 이름: ${plan.studentName || '______'}
- 탐구 방향: ${plan.inquiryType === 'review' ? '1. 되돌아보기' : '2. 나아가기'}

## 1. 탐구 주제 및 탐구 동기
- **탐구 주제**: ${plan.topic || '(미작성)'}
- **탐구 동기**: ${plan.motivation || '(미작성)'}

## 2. 이론적 배경 (배움일지, 교과서 참고)
${plan.theoreticalBackground || '(미작성)'}

## 3. 관련 도서 및 탐구 방법
- **책 제목**: ${plan.bookTitle || '(미작성)'}
- **저자 및 출판사**: ${plan.bookAuthorPublisher || '(미작성)'}
- **책 활용 방법**: ${plan.bookUsageMethod || '(미작성)'}
- **책 이외의 추가 탐구 방법**: ${plan.additionalMethod || '(미작성)'}

## 4. 탐구 보고서 내용 설계
${plan.reportDesign || '(미작성)'}
`;
    } else {
      text = `# 2026학년도 2학기 공통수학2 수행평가 보고서
- 학번: ${report.studentNumber || '______'} 이름: ${report.studentName || '______'}
- 탐구 방향: ${report.inquiryType === 'review' ? '되돌아보기' : '나아가기'}

## 1. 탐구 주제와 탐구 동기 (3점 / ${report.motivation?.length || 0}자)
- **탐구 주제**: ${report.topic || '(미작성)'}
- **탐구 동기**:
${report.motivation || '(미작성)'}

## 2. 탐구 방법 (3점)
- **선정 도서**: ${report.bookTitle} (${report.bookAuthorPublisher})
- **책 활용 방법**: ${report.bookUsageMethod || '(미작성)'}
- **추가 조사 방법**: ${report.additionalMethod || '(미작성)'}
- **도서 및 자료 지참 여부**: ${report.hasBookAndMaterialsReady ? '지참 완료' : '준비 중'}

## 3. 이론적 배경 (2점)
${report.theoreticalBackground || '(미작성)'}

## 4. 탐구 과정 및 결과 (6점 / ${(report.inquiryProcess?.length || 0) + (report.inquiryResult?.length || 0)}자)
### [탐구 과정]
${report.inquiryProcess || '(미작성)'}

### [탐구 결과 및 책과의 유기적 연결]
${report.inquiryResult || '(미작성)'}

### [수식, 그래프 및 시각 자료 정리]
${report.visualMathNotes || '(수식/도표 메모)'}

## 5. 탐구 성찰 (2점 / ${report.reflection?.length || 0}자)
${report.reflection || '(미작성)'}
`;
    }

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResetForm = () => {
    if (confirm('현재 작성 중인 계획서와 보고서 내용을 모두 비우시겠습니까?')) {
      setPlan({
        studentNumber: '',
        studentName: '',
        inquiryType: 'extend',
        topic: '',
        motivation: '',
        theoreticalBackground: '',
        bookTitle: '',
        bookAuthorPublisher: '',
        bookUsageMethod: '',
        additionalMethod: '',
        reportDesign: '',
      });
      setReport({
        studentNumber: '',
        studentName: '',
        inquiryType: 'extend',
        topic: '',
        motivation: '',
        bookTitle: '',
        bookAuthorPublisher: '',
        bookUsageMethod: '',
        additionalMethod: '',
        hasBookAndMaterialsReady: false,
        theoreticalBackground: '',
        inquiryProcess: '',
        inquiryResult: '',
        visualMathNotes: '',
        reflection: '',
      });
      setFeedback(null);
    }
  };

  const motivationLength = report.motivation?.length || 0;
  const processResultLength =
    (report.inquiryProcess?.length || 0) + (report.inquiryResult?.length || 0);
  const reflectionLength = report.reflection?.length || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-md">
                개포고 공식 양식 준수
              </span>
              <span className="text-xs text-slate-500">합산 총점 20점 만점</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>수행평가 계획서(1차시) & 보고서(2차시) 작성 스튜디오</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              10월 27일(화) 1차시 계획서(4점) 작성부터 11월 3일(화) 2차시 보고서(16점) 분량 및 루브릭
              점검까지 원스톱으로 준비하세요.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsPdfModalOpen(true)}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              title="작성한 계획서 및 보고서를 공식 A4 규격 PDF로 변환 및 다운로드"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>PDF 변환 및 다운로드</span>
            </button>

            <button
              onClick={onOpenRubric}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 border border-slate-200"
            >
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>20점 만점 기준표</span>
            </button>

            <button
              onClick={handleCopyMarkdown}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '복사 완료!' : '문서 복사하기'}</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher: Plan vs Report */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setActiveFormTab('plan')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeFormTab === 'plan'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>1차시: 계획서 작성 (10/27 화) [4점]</span>
            </button>

            <button
              onClick={() => setActiveFormTab('report')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeFormTab === 'report'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>2차시: 보고서 작성 (11/3 화) [16점]</span>
            </button>
          </div>

          {/* Reset Action */}
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={handleResetForm}
              className="px-3 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 border border-slate-200"
              title="작성 중인 내용을 모두 지우고 빈 양식으로 초기화합니다"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>작성 내용 초기화</span>
            </button>
          </div>
        </div>
      </div>

      {/* FORM: 1차시 계획서 */}
      {activeFormTab === 'plan' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">1차시 계획서 작성 유의사항 (10월 27일 화요일 제출):</span>
              <p className="mt-0.5 text-slate-700">
                수업 시간 내 제출(2점) + 성실도(2점) = 4점 배점입니다. 탐구 주제는 공통수학2(1. 도형의 방정식 ~
                2. 집합과 명제) 범위에서 설정하며, 반드시 책 한 권을 선정해 연결해야 합니다. (전자기기 사용 가능)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">학번</label>
              <input
                type="text"
                value={plan.studentNumber}
                onChange={(e) => handlePlanChange('studentNumber', e.target.value)}
                placeholder="예: 10101"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">이름</label>
              <input
                type="text"
                value={plan.studentName}
                onChange={(e) => handlePlanChange('studentName', e.target.value)}
                placeholder="홍길동"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">탐구 방향 선택</label>
              <select
                value={plan.inquiryType}
                onChange={(e) => handlePlanChange('inquiryType', e.target.value as InquiryType)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 text-slate-800"
              >
                <option value="review">1 □ 되돌아보기 (개념/증명 재학습)</option>
                <option value="extend">2 □ 나아가기 (타분야/실생활 확장)</option>
              </select>
            </div>
          </div>

          {/* Section 1 */}
          <div className="space-y-1.5 pt-1 text-xs">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">
                1
              </span>
              <span>자신의 탐구 주제를 설정하고, 그 탐구 주제를 설정하게 된 이유(동기)를 작성해보세요.</span>
            </label>
            <div className="space-y-2 mt-1">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">탐구 주제</span>
                <input
                  type="text"
                  value={plan.topic}
                  onChange={(e) => handlePlanChange('topic', e.target.value)}
                  placeholder="예: 직선의 방정식은 왜 항상 x, y에 대한 일차식으로만 나타날까?"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">탐구 동기</span>
                <textarea
                  value={plan.motivation}
                  onChange={(e) => handlePlanChange('motivation', e.target.value)}
                  rows={3}
                  placeholder="수업 시간에 배운 내용 중 어떤 의문이나 관심에서 출발했는지 구체적으로 적어주세요."
                  className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">
                2
              </span>
              <span>자신의 탐구 주제와 관련된 교과 지식을 배움일지, 교과서를 참고하여 정리해보세요. (이론적 배경)</span>
            </label>
            <textarea
              value={plan.theoreticalBackground}
              onChange={(e) => handlePlanChange('theoreticalBackground', e.target.value)}
              rows={3}
              placeholder="공통수학2 교과서의 소단원 공식, 성질, 정의 등을 정리하세요."
              className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 leading-relaxed"
            />
          </div>

          {/* Section 3 */}
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">
                3
              </span>
              <span>탐구 주제와 관련된 지식을 담고 있는 책을 선정하고 책의 어떤 부분을 참고하여 어떻게 탐구할 것인지 작성해주세요.</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">책 제목</span>
                <input
                  type="text"
                  value={plan.bookTitle}
                  onChange={(e) => handlePlanChange('bookTitle', e.target.value)}
                  placeholder="예: 세상을 바꾼 17가지 방정식"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">저자 및 출판사</span>
                <input
                  type="text"
                  value={plan.bookAuthorPublisher}
                  onChange={(e) => handlePlanChange('bookAuthorPublisher', e.target.value)}
                  placeholder="예: 이언 스튜어트 / 사이언스북스"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                />
              </div>
            </div>

            <div className="mt-2">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">책 활용 방법</span>
              <textarea
                value={plan.bookUsageMethod}
                onChange={(e) => handlePlanChange('bookUsageMethod', e.target.value)}
                rows={2}
                placeholder="책의 몇 장이나 어떤 부분을 인용/참고하여 탐구할 것인지 작성하세요."
                className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 leading-relaxed"
              />
            </div>

            <div className="mt-2">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                ※ 책 이외의 다른 추가 탐구 방법을 계획하고 있다면 구체적으로 작성해주세요.
              </span>
              <textarea
                value={plan.additionalMethod}
                onChange={(e) => handlePlanChange('additionalMethod', e.target.value)}
                rows={2}
                placeholder="논문, 웹 통계, 교과서 심화 유도 등 (11월 2일 월요일까지 사전 확인 필수!)"
                className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 leading-relaxed"
              />
            </div>
          </div>

          {/* Section 4 */}
          <div className="space-y-1.5 text-xs">
            <label className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">
                4
              </span>
              <span>탐구 보고서 내용을 어떻게 구성할 것인지 미리 작성해보세요. (설계)</span>
            </label>
            <textarea
              value={plan.reportDesign}
              onChange={(e) => handlePlanChange('reportDesign', e.target.value)}
              rows={3}
              placeholder="1. 주제와 동기 - 2. 탐구 방법 - 3. 이론적 배경 - 4. 탐구 과정 및 결과 - 5. 탐구 성찰 흐름을 적어보세요."
              className="w-full border border-slate-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 leading-relaxed"
            />
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={handleSyncPlanToReport}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors"
              >
                계획서 내용을 2차시 보고서 양식으로 연동하기 →
              </button>
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>계획서 PDF 다운로드</span>
              </button>
            </div>

            <button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isEvaluating ? '계획서 점검 중...' : '1차시 계획서(4점) AI 사전 피드백 받기'}</span>
            </button>
          </div>
        </div>
      )}

      {/* FORM: 2차시 보고서 */}
      {activeFormTab === 'report' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">2차시 보고서 작성 핵심 주의사항 (11월 3일 화요일):</span>
              <p className="mt-0.5 text-slate-700">
                ★ <strong>해당 시간에는 전자기기 사용이 절대 불가능합니다!</strong> 사전에 작성한 계획서, 선정한
                책, 11월 2일(월)까지 사전 확인받은 추가 자료만 지참할 수 있습니다. 각 항목별 원고지 분량(200자/500자/200자)
                미달 시 해당 배점이 0점 처리되므로 지금 미리 글자 수를 꼼꼼히 점검하세요!
              </p>
            </div>
          </div>

          {/* Report Section 1 */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">
                  1
                </span>
                <span>탐구 주제와 탐구 동기</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">배점 3점</span>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                    motivationLength >= 200
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {motivationLength} / 200자 {motivationLength >= 200 ? '(기준 충족)' : '(미달 주의!)'}
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-1">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  탐구 주제 (수업 연계 적절성 1점)
                </span>
                <input
                  type="text"
                  value={report.topic}
                  onChange={(e) => handleReportChange('topic', e.target.value)}
                  placeholder="공통수학2 교과 내용과 연계된 주제"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                  탐구 동기 (구체적 동기 1점 + 200자 이상 1점)
                </span>
                <textarea
                  value={report.motivation}
                  onChange={(e) => handleReportChange('motivation', e.target.value)}
                  rows={4}
                  placeholder="원고지 300칸 중 200자 이상 작성 필수. 책과 수업 내용에서 문제를 포착한 동기를 구체적으로 적으세요."
                  className="w-full border border-slate-300 rounded-lg p-3 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Report Section 2 */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">
                  2
                </span>
                <span>탐구 방법</span>
              </label>
              <span className="text-slate-500">배점 3점 (지참 1점 + 방법 적절성 2점)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">선정 도서</span>
                <input
                  type="text"
                  value={report.bookTitle}
                  onChange={(e) => handleReportChange('bookTitle', e.target.value)}
                  placeholder="도서명"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">저자 및 출판사</span>
                <input
                  type="text"
                  value={report.bookAuthorPublisher}
                  onChange={(e) => handleReportChange('bookAuthorPublisher', e.target.value)}
                  placeholder="저자 / 출판사"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="mt-2 space-y-2">
              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">책 활용 방법</span>
                <textarea
                  value={report.bookUsageMethod}
                  onChange={(e) => handleReportChange('bookUsageMethod', e.target.value)}
                  rows={2}
                  placeholder="선정한 책과 탐구에서 책을 활용하는 방법에 대해 명확하게 설명"
                  className="w-full border border-slate-300 rounded-lg p-3 leading-relaxed"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-500 block mb-1">추가 조사 방법</span>
                <textarea
                  value={report.additionalMethod}
                  onChange={(e) => handleReportChange('additionalMethod', e.target.value)}
                  rows={2}
                  placeholder="책 이외의 추가 조사 방법에 대해 명확하게 설명 (11/2 월요일까지 사전 확인 필수)"
                  className="w-full border border-slate-300 rounded-lg p-3 leading-relaxed"
                />
              </div>

              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={report.hasBookAndMaterialsReady}
                    onChange={(e) => handleReportChange('hasBookAndMaterialsReady', e.target.checked)}
                    className="rounded text-blue-600 w-4 h-4"
                  />
                  <span className="font-bold text-slate-800">
                    선정한 책 및 사전 확인받은 추가 조사 자료 지참 완료 체크 (미지참 시 1점 감점)
                  </span>
                </label>
                <span className="text-emerald-700 font-semibold text-[11px]">
                  {report.hasBookAndMaterialsReady ? '✓ 지참 준비 완료' : '미확인'}
                </span>
              </div>
            </div>
          </div>

          {/* Report Section 3 */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">
                  3
                </span>
                <span>이론적 배경</span>
              </label>
              <span className="text-slate-500">배점 2점 (오류 없이 명확히 정리 시 2점)</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              탐구 주제 관련 공통수학2 교과 내용(공식, 정의, 정리)을 수학적 오류 없이 명확하게 정리하세요.
            </p>
            <textarea
              value={report.theoreticalBackground}
              onChange={(e) => handleReportChange('theoreticalBackground', e.target.value)}
              rows={3}
              placeholder="배움일지와 교과서를 참고하여 수식과 성질을 정확히 서술"
              className="w-full border border-slate-300 rounded-lg p-3 leading-relaxed"
            />
          </div>

          {/* Report Section 4 */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">
                  4
                </span>
                <span>탐구 과정 및 결과 ★최대 배점</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">배점 6점</span>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                    processResultLength >= 500
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {processResultLength} / 500자 {processResultLength >= 500 ? '(기준 충족)' : '(미달 주의!)'}
                </span>
              </div>
            </div>

            <div className="space-y-2 mt-1">
              <div>
                <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                  탐구 과정 (논리적 전개 1점)
                </span>
                <textarea
                  value={report.inquiryProcess}
                  onChange={(e) => handleReportChange('inquiryProcess', e.target.value)}
                  rows={4}
                  placeholder="탐구 과정을 단계별로 비약 없이 논리적으로 기술하세요."
                  className="w-full border border-slate-300 rounded-lg p-3 leading-relaxed"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                  탐구 결과 (책, 추가 조사 정보와 탐구 주제의 유기적 연결 3점 + 수학적 표현 1점)
                </span>
                <textarea
                  value={report.inquiryResult}
                  onChange={(e) => handleReportChange('inquiryResult', e.target.value)}
                  rows={5}
                  placeholder="책과 추가 조사를 통해 얻은 정보를 탐구 주제와 유기적으로 연결하고 정확한 수학적 표현(수식, 기호)을 사용하세요."
                  className="w-full border border-slate-300 rounded-lg p-3 leading-relaxed"
                />
              </div>

              <div>
                <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                  ※ 하단 여백: 탐구 결과와 관련된 내용들을 자유롭게 정리해보세요. (그림, 복잡한 수식 등)
                </span>
                <textarea
                  value={report.visualMathNotes}
                  onChange={(e) => handleReportChange('visualMathNotes', e.target.value)}
                  rows={3}
                  placeholder="수식 유도 과정, 좌표평면 그래프 설명, 벤 다이어그램 등"
                  className="w-full border border-slate-300 rounded-lg p-3 font-mono leading-relaxed bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Report Section 5 */}
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs">
                  5
                </span>
                <span>탐구 성찰</span>
              </label>
              <div className="flex items-center gap-2">
                <span className="text-slate-500">배점 2점</span>
                <span
                  className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                    reflectionLength >= 200
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {reflectionLength} / 200자 {reflectionLength >= 200 ? '(기준 충족)' : '(미달 주의!)'}
                </span>
              </div>
            </div>
            <p className="text-slate-500 text-[11px]">
              원고지 400칸 중 200자 이상 작성 필수. 탐구의 한계점, 후속 탐구 의지, 느낀점 등을 풍부하게 작성하세요.
            </p>
            <textarea
              value={report.reflection}
              onChange={(e) => handleReportChange('reflection', e.target.value)}
              rows={4}
              placeholder="탐구를 통해 느낀 점과 함께, 이번 탐구의 한계점과 앞으로 더 발전시키고 싶은 후속 연구 계획을 구체적으로 적으세요."
              className="w-full border border-slate-300 rounded-lg p-3 leading-relaxed"
            />
          </div>

          {/* Action Row */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="text-slate-500">
                글자 수 합산: 총{' '}
                <strong className="text-blue-600">
                  {motivationLength + processResultLength + reflectionLength}
                </strong>
                자
              </span>
              <button
                onClick={() => setIsPdfModalOpen(true)}
                className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl transition-colors flex items-center gap-1.5"
              >
                <FileDown className="w-3.5 h-3.5" />
                <span>보고서 PDF 다운로드</span>
              </button>
            </div>

            <button
              onClick={handleEvaluate}
              disabled={isEvaluating}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isEvaluating ? '공식 루브릭 채점 중...' : '2차시 보고서(16점) AI 정밀 채점 피드백 받기'}</span>
            </button>
          </div>
        </div>
      )}

      {/* AI Feedback Display Box */}
      {feedback && (
        <div className="bg-white rounded-2xl border border-blue-200 p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-blue-100">
            <div className="flex items-center gap-2 text-blue-900 font-bold text-sm sm:text-base">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span>
                개포고 탐구 멘토의{' '}
                {activeFormTab === 'plan' ? '1차시 계획서(4점)' : '2차시 보고서(16점)'} 공식 루브릭 점검 결과
              </span>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
              공식 채점표 기반
            </span>
          </div>

          <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed space-y-2 bg-slate-50/70 p-4 rounded-xl border border-slate-200 font-sans">
            {feedback}
          </div>
        </div>
      )}

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        plan={plan}
        report={report}
        initialMode={activeFormTab}
        aiFeedback={feedback}
      />
    </div>
  );
};
