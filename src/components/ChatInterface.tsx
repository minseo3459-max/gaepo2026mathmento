import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  HelpCircle,
  FileText,
  BookmarkCheck,
} from 'lucide-react';
import { ChatMessage, InquiryType } from '../types/index.ts';
import { MathMarkdownRenderer } from './MathMarkdownRenderer.tsx';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  inquiryType: InquiryType;
  setInquiryType: (type: InquiryType) => void;
  onNavigateToTab: (tab: 'chat' | 'roadmap' | 'outline' | 'knowledge') => void;
  onClearChat: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  onSendMessage,
  isLoading,
  inquiryType,
  setInquiryType,
  onNavigateToTab,
  onClearChat,
}) => {
  const [input, setInput] = useState('');
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const msg = input.trim();
    setInput('');
    await onSendMessage(msg);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSelectDirection = (type: InquiryType) => {
    setInquiryType(type);
  };

  // Dynamic quick suggestions tailored to the chosen inquiry type
  const quickQuestions =
    inquiryType === 'review'
      ? [
          '개포고 예시처럼 "직선의 방정식은 왜 항상 일차식일까?"를 주제로 추천 책과 발췌할 부분을 알려줘',
          '"점과 직선 사이의 거리 공식 유도"를 다룬 읽기 쉬운 책 추천과 발췌 챕터 알려줘',
          '"도형의 평행이동에서 왜 부호가 반대로 들어갈까?"를 되돌아보는 탐구 아이디어 줘',
          '"루트 2는 무리수이다"의 귀류법 증명 과정을 공통수학2 수식으로 점검해줘',
          '내 초안을 검토해서 수학적 오류나 부족한 점을 루브릭 기준표에 맞게 피드백해줘',
        ]
      : [
          '개포고 예시처럼 "좌표평면의 거리를 다르게 정의"하는 《택시 기하학》 발췌 부분을 알려줘',
          '컴퓨터/AI 진로와 집합의 자카드 유사도를 연결할 수 있는 책 추천과 발췌 챕터 알려줘',
          '경제학 수요-공급 직선과 산술-기하평균 최적화를 엮을 만한 책과 링크 추천해줘',
          '의약학 분야와 원의 방정식(바이러스 확산 반경)을 연결할 수 있는 책과 발췌 부분 알려줘',
          '보고서 4번(과정 및 결과 500자)을 유기적으로 채울 수 있는 수식 모델링 팁 줘',
        ];

  return (
    <div className="flex flex-col h-[calc(100vh-125px)] max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Banner: Inquiry Direction Toggle Buttons */}
      <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Toggle Buttons: 되돌아보기 vs 나아가기 */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-700 flex items-center gap-1">
            <span>탐구 방향:</span>
          </span>

          <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
            <button
              onClick={() => handleSelectDirection('review')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                inquiryType === 'review'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>1. 되돌아보기 탐구</span>
            </button>

            <button
              onClick={() => handleSelectDirection('extend')}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
                inquiryType === 'extend'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>2. 나아가기 탐구</span>
            </button>
          </div>
        </div>

        {/* Shortcuts & New Topic Button */}
        <div className="flex items-center gap-2">
          {/* New Topic Conversation Button */}
          <button
            onClick={() => setIsClearConfirmOpen(true)}
            className="px-3 py-1.5 bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs shadow-xs"
            title="새로운 주제로 탐구를 시작하고 싶을 때 대화를 새로 시작합니다."
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>새 주제로 대화 시작</span>
          </button>

          <button
            onClick={() => onNavigateToTab('outline')}
            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 font-semibold flex items-center gap-1 transition-colors text-xs"
            title="계획서 및 보고서 작성기 열기"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>계획서·보고서 작성기</span>
          </button>
        </div>
      </div>

      {/* In-App Confirmation Modal for New Topic (Safe for iframe) */}
      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">새로운 주제로 대화 시작</h4>
                <p className="text-xs text-slate-500">새로운 탐구를 위해 이전 대화 내역을 비우시겠습니까?</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
              <div>💡 <strong>안내:</strong> 대화창이 멘토 첫 인사 상태로 초기화됩니다.</div>
              <div>(작성 중인 계획서나 보고서 내용은 그대로 유지됩니다.)</div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
              >
                계속 이어하기
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsClearConfirmOpen(false);
                  onClearChat();
                }}
                className="px-4 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>새 대화 시작하기</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Guidelines & Integrity Reminder */}
      <div className="bg-blue-50/70 border-b border-blue-100 px-4 py-2 flex items-center justify-between text-xs text-blue-900">
        <div className="flex items-center gap-1.5 flex-wrap">
          <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>개포고 원칙:</strong> 고1 눈높이에 맞춘 도서 추천(링크 & 발췌 부분 제공), 수식($\LaTeX$) 렌더링,
            원고지 분량 팁을 제공합니다. (11/3 보고서 작성 시간은 <strong>전자기기 사용 불가</strong>이므로 대필 금지)
          </span>
        </div>
        <button
          onClick={() => onNavigateToTab('outline')}
          className="text-blue-700 hover:text-blue-900 font-semibold underline underline-offset-2 flex items-center gap-0.5 whitespace-nowrap ml-2"
        >
          <span>양식 작성기로</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-50/50">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs ${
                  isUser ? 'bg-slate-800' : 'bg-blue-600'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-slate-100 text-xs text-blue-700 font-semibold">
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    <span>개포고 공통수학2 탐구 멘토</span>
                  </div>
                )}

                {/* Math & Markdown Rendering */}
                {isUser ? (
                  <div className="whitespace-pre-wrap break-words">{message.content}</div>
                ) : (
                  <MathMarkdownRenderer content={message.content} />
                )}

                {message.referenceLinks && message.referenceLinks.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs space-y-1">
                    <div className="font-semibold text-slate-600 flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      <span>추천 참고 링크 (11/2까지 사전 확인 요망):</span>
                    </div>
                    {message.referenceLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:text-blue-800 underline truncate"
                      >
                        {link.title} {link.note ? `(${link.note})` : ''}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-slate-500 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              <span>개포고 평가 기준 및 고1 수준 도서·수식을 신속하게 분석 중입니다...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      <div className="bg-slate-50 px-4 py-2 border-t border-slate-200 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-400 shrink-0 font-medium flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
            <span>
              {inquiryType === 'review' ? '되돌아보기 추천 질문:' : '나아가기 추천 질문:'}
            </span>
          </span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(q)}
              disabled={isLoading}
              className="shrink-0 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-slate-700 border border-slate-200 px-3 py-1 rounded-full transition-colors truncate max-w-[340px]"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input Box */}
      <form onSubmit={handleSubmit} className="p-3 bg-white border-t border-slate-200 flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="궁금한 내용을 자유롭게 물어보세요. 고1 수준에 맞는 책과 발췌 부분, 수식($...$) 표현을 친절히 안내해 드려요! (Enter로 전송)"
          rows={2}
          className="flex-1 resize-none rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl transition-colors shadow-xs shrink-0 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
