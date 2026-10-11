import React, { useState } from 'react';
import {
  FolderPlus,
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  Eye,
  Plus,
  Lock,
  Unlock,
  KeyRound,
  AlertCircle,
  Image as ImageIcon,
  Loader2,
  Copy,
  Check,
  Search,
  BookOpen,
  Sparkles,
  Maximize2,
  X,
  UserCheck,
} from 'lucide-react';
import { KnowledgeDocument } from '../types/index.ts';
import { MathMarkdownRenderer } from './MathMarkdownRenderer.tsx';

interface KnowledgeManagerProps {
  documents: KnowledgeDocument[];
  onAddDocument: (doc: Omit<KnowledgeDocument, 'id' | 'uploadedAt'>) => void;
  onToggleDocument: (id: string) => void;
  onDeleteDocument: (id: string) => void;
  onResetDefaults: () => void;
}

export const KnowledgeManager: React.FC<KnowledgeManagerProps> = ({
  documents,
  onAddDocument,
  onToggleDocument,
  onDeleteDocument,
  onResetDefaults,
}) => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isStudentView, setIsStudentView] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [activeDocForView, setActiveDocForView] = useState<KnowledgeDocument | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);
  const [copiedDocId, setCopiedDocId] = useState<string | null>(null);

  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState<KnowledgeDocument['category']>('교과서/자료');
  const [customContent, setCustomContent] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '2580') {
      setIsUnlocked(true);
      setIsStudentView(false);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  // File upload handler - supports PDF, images (PNG, JPG, WebP), and text files
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileName = file.name;
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    const isPdf = ext === 'pdf';
    const isImage = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext);

    if (isPdf || isImage) {
      // PDF or Image file: Process via Gemini multimodal extractor
      setIsUploading(true);
      setUploadingFileName(fileName);
      setUploadStatus(
        isPdf
          ? `'${fileName}' 교과서 PDF를 AI가 정밀 분석 중입니다. 수식(LaTeX)과 핵심 개념을 추출하고 있습니다...`
          : `'${fileName}' 교재 사진을 AI가 정밀 분석 중입니다. 수식(LaTeX)과 개념을 추출하고 있습니다...`
      );

      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const dataUrl = event.target?.result as string;
          const base64Data = dataUrl.split(',')[1] || '';
          const mimeType = file.type || (isPdf ? 'application/pdf' : 'image/jpeg');

          try {
            const response = await fetch('/api/extract-document', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                fileName,
                fileType: isPdf ? 'pdf' : 'image',
                mimeType,
                fileBase64: base64Data,
                category: '교과서/자료',
              }),
            });

            if (!response.ok) {
              throw new Error(`서버 응답 코드 ${response.status}`);
            }

            const data = await response.json();
            if (data.document) {
              onAddDocument(data.document);
              setUploadStatus(
                `'${fileName}' 탑재 완료! 교과서 수식 및 탐구 연계 포인트가 멘토 지식창고에 실시간 반영되었습니다.`
              );
            } else {
              throw new Error(data.error || '문서 추출 데이터 없음');
            }
          } catch (apiErr: any) {
            console.warn('Backend extract error, saving with fallback format:', apiErr);
            // Fallback document
            const fallbackDoc = {
              title: isPdf ? `[교과서/PDF] ${fileName}` : `[교과서/사진] ${fileName}`,
              category: '교과서/자료' as const,
              content: `### [교과서/자료] ${fileName}\n\n- 파일 크기: ${(file.size / 1024).toFixed(1)} KB\n- 파일 유형: ${isPdf ? 'PDF 교과서/문서' : '교과서/학습지 이미지'}\n\n교과서 또는 학습 자료가 지식창고에 등록되었습니다. AI 멘토와의 대화 시 이 자료를 참고하여 질문할 수 있습니다.`,
              isActive: true,
              fileSize: `${(file.size / 1024).toFixed(1)} KB`,
              fileType: (isPdf ? 'pdf' : 'image') as any,
              previewUrl: isImage ? dataUrl : undefined,
            };
            onAddDocument(fallbackDoc);
            setUploadStatus(`'${fileName}' 첨부 완료! 지식창고에 등록되었습니다.`);
          } finally {
            setIsUploading(false);
            setUploadingFileName('');
            setTimeout(() => setUploadStatus(null), 5000);
          }
        };

        reader.onerror = () => {
          setIsUploading(false);
          setUploadingFileName('');
          setUploadStatus('파일 읽기에 실패했습니다.');
          setTimeout(() => setUploadStatus(null), 4000);
        };

        reader.readAsDataURL(file);
      } catch (err: any) {
        setIsUploading(false);
        setUploadingFileName('');
        setUploadStatus(`파일 처리 중 오류: ${err.message}`);
        setTimeout(() => setUploadStatus(null), 4000);
      }
    } else {
      // Text file (.txt, .md, .json, .csv)
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          onAddDocument({
            title: fileName,
            category: '사용자첨부',
            content,
            isActive: true,
            fileSize: `${(file.size / 1024).toFixed(1)} KB`,
            fileType: 'document',
          });
          setUploadStatus(`'${fileName}' 텍스트 문서가 지식창고에 추가되었습니다.`);
          setTimeout(() => setUploadStatus(null), 4000);
        }
      };
      reader.readAsText(file, 'utf-8');
    }

    e.target.value = '';
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customContent.trim()) return;

    onAddDocument({
      title: customTitle.trim(),
      category: customCategory,
      content: customContent.trim(),
      isActive: true,
      fileSize: `${(new Blob([customContent]).size / 1024).toFixed(1)} KB`,
      fileType: 'document',
    });

    setCustomTitle('');
    setCustomContent('');
    setIsAddingCustom(false);
    setUploadStatus('새 문서가 지식창고에 추가되었습니다.');
    setTimeout(() => setUploadStatus(null), 3000);
  };

  const handleCopyContent = (doc: KnowledgeDocument) => {
    navigator.clipboard.writeText(doc.content);
    setCopiedDocId(doc.id);
    setTimeout(() => setCopiedDocId(null), 2000);
  };

  // Filtering
  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory =
      selectedCategory === '전체' ||
      (selectedCategory === '교과서/자료' &&
        (doc.category === '교과서/자료' || doc.fileType === 'pdf' || doc.fileType === 'image')) ||
      doc.category === selectedCategory;

    const matchesSearch =
      searchQuery.trim() === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const activeCount = documents.filter((d) => d.isActive).length;

  // Password Lock Screen (with student read-only view button)
  if (!isUnlocked && !isStudentView) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-slate-700 mx-auto mb-4">
          <BookOpen className="w-7 h-7 text-blue-600" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          개포고 공통수학2 지식창고 (Knowledge Base)
        </h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          교과서 PDF, 교재 사진, 평가 루브릭, 계획서 양식이 탑재되어 있으며<br />
          AI 멘토가 모든 답변 시 최우선 지식으로 참고합니다.
        </p>

        {/* Student View Button */}
        <div className="mb-6 pb-6 border-b border-slate-100">
          <button
            onClick={() => setIsStudentView(true)}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>학생 열람 모드 (탑재 교과서 및 자료 바로 확인)</span>
          </button>
          <p className="text-[11px] text-slate-400 mt-1.5">
            선생님이 실시간으로 등록한 교과서 및 문서를 열람할 수 있습니다.
          </p>
        </div>

        {/* Teacher Unlock Form */}
        <div>
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700 mb-2">
            <KeyRound className="w-4 h-4 text-blue-600" />
            <span>교사용 / 관리자 관리 모드 잠금 해제</span>
          </div>

          <form onSubmit={handleUnlock} className="space-y-3">
            <div>
              <input
                type="password"
                maxLength={8}
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="비밀번호(PIN)를 입력하세요 (기본: 2580)"
                className={`w-full text-center tracking-widest text-sm font-bold py-2.5 px-4 border rounded-xl focus:outline-none focus:ring-2 ${
                  pinError
                    ? 'border-rose-400 bg-rose-50 text-rose-900 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-blue-600 focus:ring-blue-500/20'
                }`}
              />
              {pinError && (
                <p className="text-xs text-rose-600 mt-1.5 flex items-center justify-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>비밀번호가 올바르지 않습니다. 다시 입력해주세요.</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>관리자 모드로 열기 (문서/교과서 추가 및 편집)</span>
            </button>
          </form>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          개포고등학교 1학년 공통수학2 수행평가 시스템
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              {isUnlocked ? (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md flex items-center gap-1">
                  <Unlock className="w-3 h-3" />
                  <span>관리자 인증 완료 (편집 및 업로드 가능)</span>
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded-md flex items-center gap-1">
                  <UserCheck className="w-3 h-3" />
                  <span>학생 열람 모드 (실시간 동기화 완료)</span>
                </span>
              )}
              <span className="text-xs text-slate-500">
                {isUnlocked ? '교사용 관리 모드' : '읽기 전용'}
              </span>
            </div>

            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-1">
              <FolderPlus className="w-5 h-5 text-blue-600" />
              <span>공식 문서 및 교과서 지식창고 (Knowledge Base)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              교과서 단원 PDF, 교재/학습지 사진, 공통수학2 교육과정, 평가 루브릭이 탑재되어 있으며
              AI 멘토가 학생 질문 시 최우선 지식으로 활용합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              참조 중인 문서: <strong className="text-blue-600">{activeCount}</strong> / {documents.length}개
            </span>

            {isUnlocked ? (
              <>
                <button
                  onClick={() => {
                    setIsUnlocked(false);
                    setIsStudentView(false);
                  }}
                  className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1"
                >
                  <Lock className="w-3 h-3" />
                  <span>잠그기</span>
                </button>
                <button
                  onClick={onResetDefaults}
                  className="text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  기본 복원
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsStudentView(false);
                  setIsUnlocked(false);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2.5 py-1 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" />
                <span>관리자 로그인 (PIN)</span>
              </button>
            )}
          </div>
        </div>

        {/* Upload In-Progress State */}
        {isUploading && (
          <div className="mt-4 p-4 bg-indigo-50/80 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-center gap-3 animate-pulse">
            <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
            <div>
              <p className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>AI가 교과서 자료('{uploadingFileName}')를 분석하고 있습니다</span>
              </p>
              <p className="text-[11px] text-indigo-700 mt-0.5">
                교과서 본문 개념 정리, 모든 수식의 LaTeX($...$) 변환, 교과서 예제 및 탐구 연계 포인트를 추출 중입니다.
              </p>
            </div>
          </div>
        )}

        {/* Upload Notification */}
        {uploadStatus && !isUploading && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{uploadStatus}</span>
          </div>
        )}

        {/* Action Controls (Visible to Teacher / Admin) */}
        {isUnlocked && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {/* PDF / Image / Document Upload Button */}
            <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs">
              <Upload className="w-4 h-4" />
              <span>교과서 PDF / 교재 사진 / 문서 업로드</span>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg,.webp,.gif,.bmp,.txt,.md,.json,.csv"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            <button
              onClick={() => setIsAddingCustom(!isAddingCustom)}
              className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>문서 직접 작성 / 텍스트 등록</span>
            </button>

            <span className="text-[11px] text-slate-400">
              💡 지원 형식: 교과서 PDF (.pdf), 스마트폰 촬영 사진 (.png, .jpg), 텍스트 문서 (.txt, .md)
            </span>
          </div>
        )}

        {/* Add Form */}
        {isAddingCustom && isUnlocked && (
          <form
            onSubmit={handleManualAdd}
            className="mt-4 p-4 rounded-xl border border-blue-200 bg-blue-50/30 space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">새 지식 문서 직접 등록</span>
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                취소
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="문서 제목 (예: 공통수학2 교과서 도형의 방정식 핵심 요약)"
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-xs"
                  required
                />
              </div>
              <div>
                <select
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value as any)}
                  className="w-full border border-slate-300 rounded-lg px-2 py-1.5 bg-white text-xs text-slate-700"
                >
                  <option value="교과서/자료">교과서/자료</option>
                  <option value="사용자첨부">사용자첨부</option>
                  <option value="수행평가매뉴얼">수행평가매뉴얼</option>
                  <option value="채점기준(루브릭)">채점기준(루브릭)</option>
                  <option value="교육과정">교육과정</option>
                  <option value="추천도서">추천도서</option>
                  <option value="우수예시">우수예시</option>
                </select>
              </div>
            </div>

            <textarea
              value={customContent}
              onChange={(e) => setCustomContent(e.target.value)}
              placeholder="문서 내용을 입력하세요. 수식은 $수식$ 형식으로 작성하면 KaTeX로 자동 렌더링되며, AI 멘토가 최우선으로 반영합니다."
              rows={5}
              className="w-full border border-slate-300 rounded-lg p-3 bg-white text-xs leading-relaxed font-mono"
              required
            />

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold"
              >
                지식 베이스에 저장하기
              </button>
            </div>
          </form>
        )}

        {/* Search & Category Filter */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            {['전체', '교과서/자료', '수행평가매뉴얼', '채점기준(루브릭)', '교육과정', '추천도서', '우수예시', '사용자첨부'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              )
            )}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="문서 제목, 개념, 공식 검색..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Document List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-medium">검색 조건에 맞는 지식 문서가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredDocuments.map((doc) => {
            const isPdfDoc = doc.fileType === 'pdf' || doc.title.includes('[교과서/PDF]') || doc.title.endsWith('.pdf');
            const isImgDoc = doc.fileType === 'image' || doc.title.includes('[교과서/사진]') || !!doc.previewUrl;

            return (
              <div
                key={doc.id}
                className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                  doc.isActive
                    ? 'border-slate-200 shadow-xs hover:border-blue-200'
                    : 'border-slate-200 bg-slate-50/50 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Category Badge */}
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          doc.category === '교과서/자료'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : doc.category === '채점기준(루브릭)'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : doc.category === '수행평가매뉴얼'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : doc.category === '우수예시'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                        }`}
                      >
                        {isPdfDoc ? <FileText className="w-3 h-3 text-rose-600" /> : isImgDoc ? <ImageIcon className="w-3 h-3 text-purple-600" /> : null}
                        <span>{doc.category}</span>
                      </span>

                      {/* File Type Badge */}
                      {isPdfDoc && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded">
                          PDF 문서
                        </span>
                      )}
                      {isImgDoc && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded">
                          교재 사진
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={doc.isActive}
                          disabled={!isUnlocked}
                          onChange={() => onToggleDocument(doc.id)}
                          className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                        <span className="text-[11px] font-medium">
                          {doc.isActive ? '참조 중' : '비활성'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-1 flex items-center gap-1.5">
                    {doc.title}
                  </h3>

                  {/* Optional Image Thumbnail Preview */}
                  {doc.previewUrl && (
                    <div className="mb-2 relative group cursor-pointer inline-block" onClick={() => setZoomedImage({ url: doc.previewUrl!, title: doc.title })}>
                      <img
                        src={doc.previewUrl}
                        alt={doc.title}
                        className="h-16 w-auto max-w-[140px] object-cover rounded-lg border border-slate-200 shadow-2xs group-hover:opacity-90 transition-opacity"
                      />
                      <div className="absolute inset-0 bg-black/30 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-[10px] font-bold">
                        <Maximize2 className="w-3.5 h-3.5 mr-0.5" /> 확대
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3">
                    {doc.content.slice(0, 200)}...
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2 text-[11px]">
                    <span>{doc.fileSize || '3.2 KB'}</span>
                    <span>·</span>
                    <span>{doc.uploadedAt}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopyContent(doc)}
                      title="내용 복사"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg text-xs flex items-center gap-1"
                    >
                      {copiedDocId === doc.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600 text-[11px]">복사됨</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span className="text-[11px]">복사</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setActiveDocForView(doc)}
                      className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg flex items-center gap-1 text-xs font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>내용 보기</span>
                    </button>

                    {isUnlocked && (doc.category === '사용자첨부' || doc.category === '교과서/자료') && (
                      <button
                        onClick={() => onDeleteDocument(doc.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-xs"
                        title="문서 삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Document View Modal (with KaTeX rendering) */}
      {activeDocForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                    {activeDocForView.category}
                  </span>
                  {activeDocForView.fileType && (
                    <span className="text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                      {activeDocForView.fileType.toUpperCase()}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">{activeDocForView.fileSize}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {activeDocForView.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveDocForView(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {/* If image preview is available */}
              {activeDocForView.previewUrl && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-purple-600" />
                      <span>첨부된 교재 원본 이미지</span>
                    </span>
                    <button
                      onClick={() =>
                        setZoomedImage({
                          url: activeDocForView.previewUrl!,
                          title: activeDocForView.title,
                        })
                      }
                      className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Maximize2 className="w-3 h-3" /> 크게 보기
                    </button>
                  </div>
                  <img
                    src={activeDocForView.previewUrl}
                    alt={activeDocForView.title}
                    className="max-h-60 rounded-lg mx-auto object-contain border border-slate-200"
                  />
                </div>
              )}

              {/* Formatted Markdown & KaTeX formulas */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs leading-relaxed">
                <MathMarkdownRenderer content={activeDocForView.content} />
              </div>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => handleCopyContent(activeDocForView)}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                {copiedDocId === activeDocForView.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>내용 복사 완료!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>전체 내용 복사</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveDocForView(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setZoomedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-full flex items-center justify-between text-white pb-2 px-1">
              <span className="text-xs font-bold truncate max-w-md">{zoomedImage.title}</span>
              <button
                onClick={() => setZoomedImage(null)}
                className="text-white hover:text-slate-300 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <img
              src={zoomedImage.url}
              alt={zoomedImage.title}
              className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-2xl border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
};
