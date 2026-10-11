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
} from 'lucide-react';
import { KnowledgeDocument } from '../types/index.ts';

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
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const [activeDocForView, setActiveDocForView] = useState<KnowledgeDocument | null>(null);
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState<KnowledgeDocument['category']>('사용자첨부');
  const [customContent, setCustomContent] = useState('');
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.trim() === '2580') {
      setIsUnlocked(true);
      setPinError(false);
      setPinInput('');
    } else {
      setPinError(true);
      setPinInput('');
    }
  };

  // If not unlocked, render the Password Protection screen
  if (!isUnlocked) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200 p-8 shadow-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mx-auto mb-4">
          <KeyRound className="w-7 h-7 text-blue-600" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          교사용 / 관리자 지식창고 보안 잠금
        </h3>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          학생들의 자기주도적 탐구와 공정한 평가 준비를 위해<br />
          공식 문서 및 지식창고 관리는 인증 후 열람할 수 있습니다.
        </p>

        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <input
              type="password"
              maxLength={8}
              value={pinInput}
              onChange={(e) => {
                setPinInput(e.target.value);
                setPinError(false);
              }}
              placeholder="비밀번호(PIN)를 입력하세요"
              autoFocus
              className={`w-full text-center tracking-widest text-base font-bold py-2.5 px-4 border rounded-xl focus:outline-none focus:ring-2 ${
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
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5"
          >
            <Unlock className="w-4 h-4" />
            <span>지식창고 열기</span>
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
          개포고등학교 1학년 공통수학2 수행평가 시스템 보안 모드
        </div>
      </div>
    );
  }

  // File upload handler (reads .txt, .md, .json, etc.)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();

    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onAddDocument({
          title: file.name,
          category: '사용자첨부',
          content,
          isActive: true,
          fileSize: `${(file.size / 1024).toFixed(1)} KB`,
        });
        setUploadStatus(`'${file.name}' 첨부 완료! 멘토 지식 베이스에 즉시 반영되었습니다.`);
        setTimeout(() => setUploadStatus(null), 3000);
      }
    };

    reader.readAsText(file, 'utf-8');
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
    });

    setCustomTitle('');
    setCustomContent('');
    setIsAddingCustom(false);
    setUploadStatus('새 문서가 지식창고에 추가되었습니다.');
    setTimeout(() => setUploadStatus(null), 3000);
  };

  const activeCount = documents.filter((d) => d.isActive).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md flex items-center gap-1">
                <Unlock className="w-3 h-3" />
                <span>관리자 인증 완료</span>
              </span>
              <span className="text-xs text-slate-500">비밀번호 2580 확인됨</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mt-1">
              <FolderPlus className="w-5 h-5 text-blue-600" />
              <span>공식 문서 및 지식창고 관리 (Knowledge Base)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              교사용 공통수학2 교육과정, 평가 루브릭, 계획서/보고서 서식, 추천 도서 목록이 탑재되어 있으며
              AI 멘토가 최우선으로 참고합니다.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
              활성화 문서: <strong className="text-blue-600">{activeCount}</strong> / {documents.length}개
            </span>
            <button
              onClick={() => setIsUnlocked(false)}
              className="text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              <span>다시 잠그기</span>
            </button>
            <button
              onClick={onResetDefaults}
              className="text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              기본 복원
            </button>
          </div>
        </div>

        {/* Upload Notification */}
        {uploadStatus && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{uploadStatus}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="cursor-pointer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs">
            <Upload className="w-4 h-4" />
            <span>파일 첨부 (.txt, .md, .json)</span>
            <input
              type="file"
              accept=".txt,.md,.json,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setIsAddingCustom(!isAddingCustom)}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>문서 직접 작성 / 텍스트 붙여넣기</span>
          </button>
        </div>

        {/* Add Form */}
        {isAddingCustom && (
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
                  placeholder="문서 제목 (예: 개포고 공통수학2 추가 공지)"
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
              placeholder="문서 내용을 입력하세요. AI 멘토가 학생 질문 시 이 내용을 최우선으로 반영합니다."
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
      </div>

      {/* Document List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className={`bg-white rounded-2xl border p-5 flex flex-col justify-between transition-all ${
              doc.isActive ? 'border-slate-200 shadow-xs' : 'border-slate-200 bg-slate-50/50 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                    doc.category === '채점기준(루브릭)'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : doc.category === '수행평가매뉴얼'
                      ? 'bg-blue-50 text-blue-800 border-blue-200'
                      : doc.category === '우수예시'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                  }`}
                >
                  {doc.category}
                </span>

                <div className="flex items-center gap-2">
                  <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={doc.isActive}
                      onChange={() => onToggleDocument(doc.id)}
                      className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                    />
                    <span className="text-[11px] font-medium">
                      {doc.isActive ? '참조 중' : '비활성'}
                    </span>
                  </label>
                </div>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mb-1.5 line-clamp-1">{doc.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-3">
                {doc.content.slice(0, 180)}...
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2 text-[11px]">
                <span>{doc.fileSize || '3.2 KB'}</span>
                <span>·</span>
                <span>{doc.uploadedAt}</span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveDocForView(doc)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1 text-xs"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>내용 보기</span>
                </button>

                {doc.category === '사용자첨부' && (
                  <button
                    onClick={() => onDeleteDocument(doc.id)}
                    className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* View Modal */}
      {activeDocForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {activeDocForView.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {activeDocForView.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveDocForView(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg"
              >
                닫기
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <pre className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans bg-slate-50 p-4 rounded-xl border border-slate-200">
                {activeDocForView.content}
              </pre>
            </div>

            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
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
    </div>
  );
};
