import React, { useRef, useState } from 'react';
import {
  FileDown,
  Printer,
  X,
  CheckCircle2,
  Calendar,
  FileText,
  Sparkles,
  BookOpen,
  Award,
  Layers,
  Loader2,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { PlanDraft, ReportDraft } from '../types/index.ts';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PlanDraft;
  report: ReportDraft;
  initialMode?: 'plan' | 'report' | 'all';
  aiFeedback?: string | null;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  plan,
  report,
  initialMode = 'plan',
  aiFeedback,
}) => {
  const [exportMode, setExportMode] = useState<'plan' | 'report' | 'all'>(initialMode);
  const [includeFeedback, setIncludeFeedback] = useState<boolean>(Boolean(aiFeedback));
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const studentName = (exportMode === 'plan' ? plan.studentName : report.studentName) || '학생';
  const studentNumber = (exportMode === 'plan' ? plan.studentNumber : report.studentNumber) || '______';
  const inquiryType = exportMode === 'plan' ? plan.inquiryType : report.inquiryType;

  // OKLCH to sRGB conversion math for html2canvas compatibility
  const oklchToRgb = (l: number, c: number, h: number, a = 1): string => {
    h = isNaN(h) ? 0 : h;
    c = isNaN(c) ? 0 : c;
    l = isNaN(l) ? 0 : l;
    const hRad = ((h || 0) * Math.PI) / 180;
    const aLab = c * Math.cos(hRad);
    const bLab = c * Math.sin(hRad);

    const l_ = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
    const m_ = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
    const s_ = l - 0.0894841775 * aLab - 1.2914855480 * bLab;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    const rLinear = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const gLinear = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const bLinear = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3;

    const gamma = (x: number) => {
      if (x <= 0.0031308) return Math.max(0, Math.min(255, Math.round(12.92 * x * 255)));
      return Math.max(0, Math.min(255, Math.round((1.055 * Math.pow(Math.max(0, x), 1 / 2.4) - 0.055) * 255)));
    };

    const r = gamma(rLinear);
    const g = gamma(gLinear);
    const b = gamma(bLinear);

    return a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : `rgb(${r}, ${g}, ${b})`;
  };

  const sanitizeOklchColors = (str: string): string => {
    if (!str || typeof str !== 'string') return str;
    if (!str.includes('oklch') && !str.includes('lab(')) return str;

    let res = str.replace(
      /oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+([\d.]+(?:deg|grad|rad|turn)?|none)(?:\s*\/\s*([\d.]+%?|none))?\s*\)/gi,
      (_full, lStr, cStr, hStr, aStr) => {
        const l = lStr.endsWith('%') ? parseFloat(lStr) / 100 : parseFloat(lStr);
        const c = cStr === 'none' ? 0 : cStr.endsWith('%') ? parseFloat(cStr) / 100 : parseFloat(cStr);
        let h = hStr === 'none' ? 0 : parseFloat(hStr);
        if (hStr.endsWith('rad')) h = (h * 180) / Math.PI;
        else if (hStr.endsWith('turn')) h = h * 360;
        else if (hStr.endsWith('grad')) h = (h * 360) / 400;

        let a = 1;
        if (aStr && aStr !== 'none') {
          a = aStr.endsWith('%') ? parseFloat(aStr) / 100 : parseFloat(aStr);
        }
        return oklchToRgb(l, c, h, a);
      }
    );

    // Fallback for any other lab() syntax
    if (res.includes('lab(')) {
      res = res.replace(/lab\([^)]+\)/gi, 'rgb(15, 23, 42)');
    }

    return res;
  };

  // Real PDF Generation using html2canvas & jsPDF with OKLCH compatibility patch
  const handleDownloadPdf = async () => {
    if (!printAreaRef.current) return;
    setIsGenerating(true);
    setDownloadSuccess(false);

    try {
      const element = printAreaRef.current;

      // Render the element to a high-resolution canvas with oklch sanitizer
      const canvas = await html2canvas(element, {
        scale: 2, // 2x DPI for crisp text
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          // 1. Sanitize all <style> tags in the cloned document so oklch is replaced by rgb
          clonedDoc.querySelectorAll('style').forEach((styleEl) => {
            if (styleEl.textContent && (styleEl.textContent.includes('oklch') || styleEl.textContent.includes('lab('))) {
              styleEl.textContent = sanitizeOklchColors(styleEl.textContent);
            }
          });

          // 2. Ensure root and body elements have solid standard hex backgrounds
          if (clonedDoc.documentElement) {
            clonedDoc.documentElement.style.backgroundColor = '#ffffff';
            clonedDoc.documentElement.style.color = '#0f172a';
          }
          if (clonedDoc.body) {
            clonedDoc.body.style.backgroundColor = '#ffffff';
            clonedDoc.body.style.color = '#0f172a';
          }

          // 3. Monkey-patch getComputedStyle in the cloned iframe's window so it never returns oklch
          const win = clonedDoc.defaultView;
          if (win && win.getComputedStyle) {
            const originalGetComputedStyle = win.getComputedStyle.bind(win);
            win.getComputedStyle = function (el: Element, pseudoElt?: string | null) {
              const style = originalGetComputedStyle(el, pseudoElt);
              return new Proxy(style, {
                get(target, prop: string | symbol) {
                  if (prop === 'getPropertyValue') {
                    return (propertyName: string) => {
                      const val = target.getPropertyValue(propertyName);
                      return sanitizeOklchColors(val);
                    };
                  }
                  const val = (target as any)[prop];
                  if (typeof val === 'string') {
                    return sanitizeOklchColors(val);
                  }
                  if (typeof val === 'function') {
                    return val.bind(target);
                  }
                  return val;
                },
              });
            } as any;
          }

          // 4. Force convert any computed colors on all elements in cloned tree into explicit inline hex/rgb styles
          const allEls = clonedDoc.querySelectorAll('*');
          allEls.forEach((node) => {
            const el = node as HTMLElement;
            if (el && el.style) {
              const comp = win ? win.getComputedStyle(el) : window.getComputedStyle(el);
              if (comp) {
                if (comp.color && comp.color.includes('oklch')) {
                  el.style.color = sanitizeOklchColors(comp.color);
                }
                if (comp.backgroundColor && comp.backgroundColor.includes('oklch')) {
                  el.style.backgroundColor = sanitizeOklchColors(comp.backgroundColor);
                }
                if (comp.borderColor && comp.borderColor.includes('oklch')) {
                  el.style.borderColor = sanitizeOklchColors(comp.borderColor);
                }
                if (comp.outlineColor && comp.outlineColor.includes('oklch')) {
                  el.style.outlineColor = sanitizeOklchColors(comp.outlineColor);
                }
                if (comp.textDecorationColor && comp.textDecorationColor.includes('oklch')) {
                  el.style.textDecorationColor = sanitizeOklchColors(comp.textDecorationColor);
                }
              }
            }
          });
        },
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      // A4 dimensions in mm: 210 x 297
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = 210;
      const pdfHeight = 297;
      const margin = 10; // 10mm margin
      const contentWidth = pdfWidth - margin * 2; // 190mm
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      let heightLeft = contentHeight;
      let position = margin;

      // First page
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
      heightLeft -= (pdfHeight - margin * 2);

      // Subsequent pages if content overflows A4 height
      while (heightLeft > 0) {
        position = heightLeft - contentHeight + margin;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, contentHeight);
        heightLeft -= (pdfHeight - margin * 2);
      }

      const fileTypeLabel =
        exportMode === 'plan' ? '계획서' : exportMode === 'report' ? '보고서' : '수행평가통합본';
      const fileName = `개포고_공통수학2_${fileTypeLabel}_${studentNumber}_${studentName}.pdf`;

      pdf.save(fileName);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('PDF export failed:', err);
      alert('PDF 생성 중 오류가 발생했습니다. 브라우저 인쇄(Ctrl+P) 기능을 이용해 PDF로 저장해 주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Browser Native Print
  const handleNativePrint = () => {
    window.print();
  };

  const motivationLength = report.motivation?.length || 0;
  const processResultLength =
    (report.inquiryProcess?.length || 0) + (report.inquiryResult?.length || 0);
  const reflectionLength = report.reflection?.length || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>수행평가 문서 PDF 변환 및 다운로드</span>
                <span className="text-[11px] font-semibold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                  A4 공식 규격
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                개포고등학교 공통수학2 수행평가 공식 양식에 맞추어 깔끔한 PDF 파일로 변환합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Toolbar */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0 text-xs">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setExportMode('plan')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                exportMode === 'plan'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>1차시 계획서 (4점)</span>
            </button>
            <button
              onClick={() => setExportMode('report')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                exportMode === 'report'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>2차시 보고서 (16점)</span>
            </button>
            <button
              onClick={() => setExportMode('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                exportMode === 'all'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>계획서 + 보고서 통합본</span>
            </button>
          </div>

          {/* Feedback Checkbox & Actions */}
          <div className="flex items-center gap-3">
            {aiFeedback && (
              <label className="flex items-center gap-1.5 text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={includeFeedback}
                  onChange={(e) => setIncludeFeedback(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-slate-700">AI 루브릭 채점 피드백 포함</span>
              </label>
            )}

            <button
              onClick={handleNativePrint}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-slate-200"
              title="브라우저 인쇄 대화상자 열기 (Ctrl+P)"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>인쇄</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PDF 변환 중...</span>
                </>
              ) : downloadSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                  <span>다운로드 완료!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>PDF 다운로드 (.pdf)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/80">
          <div className="text-[11px] text-slate-400 text-center mb-2">
            ▼ 아래 문서는 실제 PDF로 다운로드 및 인쇄되는 A4 용지 규격 레이아웃입니다.
          </div>

          {/* Paper Container (Styled for official printable document) */}
          <div
            ref={printAreaRef}
            className="max-w-[780px] mx-auto bg-white p-8 sm:p-10 shadow-md border border-slate-300 text-slate-900 font-sans leading-normal print:p-0 print:border-none print:shadow-none"
            style={{ minHeight: '1000px', backgroundColor: '#ffffff', color: '#0f172a', borderColor: '#cbd5e1' }}
          >
            {/* Document Header */}
            <div className="border-b-2 border-slate-900 pb-3 mb-5 text-center">
              <div className="text-xs font-bold text-slate-600 tracking-wider mb-1">
                2026학년도 개포고등학교 1학년 2학기 공통수학2 수행평가
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                독서와 함께하는 수학으로 확장하기
              </h1>
              <div className="mt-2 inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold rounded-sm tracking-widest">
                {exportMode === 'plan' && '【 1차시 계획서 】'}
                {exportMode === 'report' && '【 2차시 보고서 】'}
                {exportMode === 'all' && '【 1차시 계획서 & 2차시 보고서 통합본 】'}
              </div>
            </div>

            {/* Student Metadata Table */}
            <div className="mb-6">
              <table className="w-full border-collapse border border-slate-800 text-xs">
                <tbody>
                  <tr>
                    <th className="border border-slate-800 bg-slate-100 px-3 py-2 w-20 text-center font-bold">
                      학 번
                    </th>
                    <td className="border border-slate-800 px-3 py-2 w-32 font-medium">
                      {studentNumber}
                    </td>
                    <th className="border border-slate-800 bg-slate-100 px-3 py-2 w-20 text-center font-bold">
                      성 명
                    </th>
                    <td className="border border-slate-800 px-3 py-2 w-32 font-medium">
                      {studentName}
                    </td>
                    <th className="border border-slate-800 bg-slate-100 px-3 py-2 w-24 text-center font-bold">
                      탐구 방향
                    </th>
                    <td className="border border-slate-800 px-3 py-2 font-medium">
                      {inquiryType === 'review'
                        ? '■ 1. 되돌아보기 탐구 (개념 재학습)'
                        : '■ 2. 나아가기 탐구 (타분야/모델 확장)'}
                    </td>
                  </tr>
                  <tr>
                    <th className="border border-slate-800 bg-slate-100 px-3 py-2 text-center font-bold">
                      선정 도서
                    </th>
                    <td colSpan={3} className="border border-slate-800 px-3 py-2 font-medium">
                      {exportMode === 'plan' ? plan.bookTitle : report.bookTitle} (
                      {exportMode === 'plan' ? plan.bookAuthorPublisher : report.bookAuthorPublisher})
                    </td>
                    <th className="border border-slate-800 bg-slate-100 px-3 py-2 text-center font-bold">
                      제출 일자
                    </th>
                    <td className="border border-slate-800 px-3 py-2 font-medium">
                      {exportMode === 'plan'
                        ? '2026. 10. 27.(화)'
                        : exportMode === 'report'
                        ? '2026. 11. 03.(화)'
                        : '10/27 및 11/3'}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ================= 1차시 계획서 뷰 ================= */}
            {(exportMode === 'plan' || exportMode === 'all') && (
              <div className="space-y-4 mb-8">
                {exportMode === 'all' && (
                  <div className="bg-slate-800 text-white px-3 py-1.5 text-xs font-bold rounded-sm mb-3">
                    [제1부: 1차시 계획서 (10월 27일 제출용 / 4점 만점)]
                  </div>
                )}

                {/* Plan 1 */}
                <div className="border border-slate-800 rounded-sm">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs border-b border-slate-800 flex items-center justify-between">
                    <span>1. 자신의 탐구 주제를 설정하고, 탐구 동기(이유)를 작성해보세요.</span>
                  </div>
                  <div className="p-3 text-xs space-y-2">
                    <div>
                      <strong className="text-slate-800">탐구 주제: </strong>
                      <span className="font-semibold text-blue-900">{plan.topic || '(미작성)'}</span>
                    </div>
                    <div>
                      <strong className="text-slate-800">탐구 동기:</strong>
                      <p className="mt-1 text-slate-800 whitespace-pre-wrap leading-relaxed pl-2 border-l-2 border-slate-300">
                        {plan.motivation || '(미작성)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Plan 2 */}
                <div className="border border-slate-800 rounded-sm">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs border-b border-slate-800">
                    <span>2. 탐구 주제와 관련된 교과 지식을 배움일지, 교과서를 참고하여 정리해보세요. (이론적 배경)</span>
                  </div>
                  <div className="p-3 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {plan.theoreticalBackground || '(미작성)'}
                  </div>
                </div>

                {/* Plan 3 */}
                <div className="border border-slate-800 rounded-sm">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs border-b border-slate-800">
                    <span>3. 관련 도서 선정 및 책 활용 방법, 추가 탐구 방법</span>
                  </div>
                  <div className="p-3 text-xs space-y-2 text-slate-800">
                    <div>
                      <strong className="text-slate-800">책 제목 및 저자/출판사: </strong>
                      <span>
                        {plan.bookTitle || '(미작성)'} ({plan.bookAuthorPublisher || '(미작성)'})
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-800">책 활용 방법: </strong>
                      <p className="mt-0.5 whitespace-pre-wrap leading-relaxed pl-2 border-l-2 border-slate-300">
                        {plan.bookUsageMethod || '(미작성)'}
                      </p>
                    </div>
                    <div>
                      <strong className="text-slate-800">책 이외의 추가 탐구 방법: </strong>
                      <p className="mt-0.5 whitespace-pre-wrap leading-relaxed pl-2 border-l-2 border-slate-300">
                        {plan.additionalMethod || '(미작성)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Plan 4 */}
                <div className="border border-slate-800 rounded-sm">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs border-b border-slate-800">
                    <span>4. 탐구 보고서 내용 설계</span>
                  </div>
                  <div className="p-3 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {plan.reportDesign || '(미작성)'}
                  </div>
                </div>
              </div>
            )}

            {/* ================= 2차시 보고서 뷰 ================= */}
            {(exportMode === 'report' || exportMode === 'all') && (
              <div className="space-y-4 mb-6">
                {exportMode === 'all' && (
                  <div className="bg-slate-800 text-white px-3 py-1.5 text-xs font-bold rounded-sm mb-3">
                    [제2부: 2차시 보고서 (11월 3일 작성용 / 16점 만점 / 전자기기 불가)]
                  </div>
                )}

                {/* Report 1 */}
                <div className="border border-slate-800 rounded-sm">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs border-b border-slate-800 flex items-center justify-between">
                    <span>1. 탐구 주제와 탐구 동기 (배점 3점)</span>
                    <span className="text-[11px] text-slate-600 font-normal">
                      동기 분량: <strong>{motivationLength}</strong>자 / 200자 기준
                    </span>
                  </div>
                  <div className="p-3 text-xs space-y-2">
                    <div>
                      <strong className="text-slate-800">탐구 주제: </strong>
                      <span className="font-semibold text-blue-900">{report.topic || '(미작성)'}</span>
                    </div>
                    <div>
                      <strong className="text-slate-800">탐구 동기 (200자 이상):</strong>
                      <p className="mt-1 text-slate-800 whitespace-pre-wrap leading-relaxed pl-2 border-l-2 border-slate-300">
                        {report.motivation || '(미작성)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Report 2 */}
                <div className="border border-slate-800 rounded-sm">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs border-b border-slate-800 flex items-center justify-between">
                    <span>2. 탐구 방법 (배점 3점)</span>
                    <span className="text-[11px] text-slate-600 font-normal">
                      도서 및 자료 지참 확인: {report.hasBookAndMaterialsReady ? '■ 지참 완료' : '□ 미확인'}
                    </span>
                  </div>
                  <div className="p-3 text-xs space-y-2 text-slate-800">
                    <div>
                      <strong className="text-slate-800">선정 도서: </strong>
                      <span>
                        {report.bookTitle || '(미작성)'} ({report.bookAuthorPublisher || '(미작성)'})
                      </span>
                    </div>
                    <div>
                      <strong className="text-slate-800">책 활용 방법 및 추가 조사 방법:</strong>
                      <p className="mt-0.5 whitespace-pre-wrap leading-relaxed pl-2 border-l-2 border-slate-300">
                        {report.bookUsageMethod || report.additionalMethod
                          ? `${report.bookUsageMethod || ''}\n${report.additionalMethod || ''}`
                          : '(미작성)'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Report 3 */}
                <div className="border border-slate-800 rounded-sm">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs border-b border-slate-800">
                    <span>3. 이론적 배경 (배점 2점)</span>
                  </div>
                  <div className="p-3 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {report.theoreticalBackground || '(미작성)'}
                  </div>
                </div>

                {/* Report 4 */}
                <div className="border border-slate-800 rounded-sm">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs border-b border-slate-800 flex items-center justify-between">
                    <span>4. 탐구 과정 및 결과 (배점 6점)</span>
                    <span className="text-[11px] text-slate-600 font-normal">
                      과정 및 결과 분량: <strong>{processResultLength}</strong>자 / 500자 기준
                    </span>
                  </div>
                  <div className="p-3 text-xs space-y-3 text-slate-800">
                    <div>
                      <strong className="text-blue-900 block mb-1">【 탐구 과정 】</strong>
                      <p className="whitespace-pre-wrap leading-relaxed pl-2 border-l-2 border-blue-200">
                        {report.inquiryProcess || '(미작성)'}
                      </p>
                    </div>
                    <div>
                      <strong className="text-blue-900 block mb-1">【 탐구 결과 및 책과의 유기적 연결 】</strong>
                      <p className="whitespace-pre-wrap leading-relaxed pl-2 border-l-2 border-blue-200">
                        {report.inquiryResult || '(미작성)'}
                      </p>
                    </div>
                    {report.visualMathNotes && (
                      <div>
                        <strong className="text-slate-700 block mb-1">【 수학적 표현 메모 (수식 및 그래프 도식) 】</strong>
                        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-sm font-mono text-[11px] whitespace-pre-wrap">
                          {report.visualMathNotes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Report 5 */}
                <div className="border border-slate-800 rounded-sm">
                  <div className="bg-slate-100 px-3 py-1.5 font-bold text-xs border-b border-slate-800 flex items-center justify-between">
                    <span>5. 탐구 성찰 (배점 2점)</span>
                    <span className="text-[11px] text-slate-600 font-normal">
                      성찰 분량: <strong>{reflectionLength}</strong>자 / 200자 기준
                    </span>
                  </div>
                  <div className="p-3 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                    {report.reflection || '(미작성)'}
                  </div>
                </div>
              </div>
            )}

            {/* AI Rubric Feedback Section if checked */}
            {includeFeedback && aiFeedback && (
              <div className="border border-blue-400 bg-blue-50/40 rounded-sm p-4 mb-6 text-xs text-slate-800">
                <div className="font-bold text-blue-950 mb-1 flex items-center gap-1.5 pb-1 border-b border-blue-200">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>[참고 부록] AI 공식 루브릭 정밀 사전 점검 피드백</span>
                </div>
                <div className="whitespace-pre-wrap leading-relaxed text-[11px] mt-2">
                  {aiFeedback}
                </div>
              </div>
            )}

            {/* Official Teacher Grading & Confirmation Box */}
            <div className="mt-8 pt-4 border-t border-slate-300">
              <table className="w-full border-collapse border border-slate-800 text-xs text-center">
                <thead>
                  <tr className="bg-slate-100 font-bold">
                    <th className="border border-slate-800 py-1.5">1차시 계획서(4점)</th>
                    <th className="border border-slate-800 py-1.5">2차시 보고서(16점)</th>
                    <th className="border border-slate-800 py-1.5">합계(20점)</th>
                    <th className="border border-slate-800 py-1.5">채점 교사 확인</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="h-12 font-medium">
                    <td className="border border-slate-800">/ 4점</td>
                    <td className="border border-slate-800">/ 16점</td>
                    <td className="border border-slate-800 font-bold text-slate-900">/ 20점</td>
                    <td className="border border-slate-800 text-slate-400 font-normal">(인 또는 서명)</td>
                  </tr>
                </tbody>
              </table>
              <div className="mt-3 text-[11px] text-slate-400 text-right">
                개포고등학교 1학년 공통수학2 교과협의회
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0 text-xs">
          <div className="text-slate-500">
            문서 분량 요약: 계획서 완료 · 보고서 합산 글자 수{' '}
            <strong className="text-blue-600">
              {motivationLength + processResultLength + reflectionLength}
            </strong>
            자
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-300 transition-colors"
            >
              닫기
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>PDF 생성 중...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>PDF 파일로 다운로드</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
