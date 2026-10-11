/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { ChatInterface } from './components/ChatInterface.tsx';
import { StepRoadmap } from './components/StepRoadmap.tsx';
import { OutlineBuilder } from './components/OutlineBuilder.tsx';
import { KnowledgeManager } from './components/KnowledgeManager.tsx';
import { RubricModal } from './components/RubricModal.tsx';
import { DEFAULT_KNOWLEDGE_DOCS } from './data/defaultKnowledge.ts';
import {
  ChatMessage,
  InquiryType,
  KnowledgeDocument,
  PlanDraft,
  ReportDraft,
  StepId,
} from './types/index.ts';

const STORAGE_KEY_DOCS = 'gaepo_math_knowledge_docs_v3';
const STORAGE_KEY_PLAN = 'gaepo_math_plan_draft_v3';
const STORAGE_KEY_REPORT = 'gaepo_math_report_draft_v3';
const STORAGE_KEY_CHAT = 'gaepo_math_chat_history_v3';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'chat' | 'roadmap' | 'outline' | 'knowledge'>('chat');
  const [currentStep, setCurrentStep] = useState<StepId>(0);
  const [inquiryType, setInquiryType] = useState<InquiryType>('extend');
  const [selectedUnit, setSelectedUnit] = useState<string>('2. 직선의 방정식');
  const [isRubricOpen, setIsRubricOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Knowledge Documents (Default + Teacher additions)
  const [documents, setDocuments] = useState<KnowledgeDocument[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DOCS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return DEFAULT_KNOWLEDGE_DOCS;
  });

  // 1차시 계획서 상태 (10/27 제출용)
  const [plan, setPlan] = useState<PlanDraft>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLAN);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
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
    };
  });

  // 2차시 보고서 상태 (11/3 작성용)
  const [report, setReport] = useState<ReportDraft>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return {
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
    };
  });

  // Initial welcome message from mentor (concise and clear role introduction)
  const initialWelcomeMessage: ChatMessage = {
    id: 'welcome-msg-1',
    role: 'assistant',
    content: `안녕하세요! 개포고등학교 1학년 공통수학2 **'독서와 함께하는 수학으로 확장하기'** AI 탐구 멘토입니다. 🏫✨

저는 여러분이 책을 읽고 수학적 원리를 스스로 발견하여 계획서와 보고서를 완성할 수 있도록 돕는 역할을 합니다:
- **도서 추천 및 발췌 안내**: 고1 수준에 맞는 읽기 쉬운 책(링크 포함)과 참고할 구체적인 챕터 추천
- **수학적 개념 & 수식 점검**: 공통수학2(도형의 방정식, 집합과 명제) 개념 오류 확인 및 $\\LaTeX$ 수식 표현 지원
- **루브릭 기반 셀프 피드백**: 대필 없이 스스로 완성할 수 있도록 질문과 힌트, 원고지 분량(200자/500자) 조언

상단의 버튼으로 **[1. 되돌아보기 탐구]** 또는 **[2. 나아가기 탐구]**를 선택하신 후, 궁금한 점이나 관심 주제를 편하게 입력해주세요! 😊`,
    timestamp: Date.now(),
    step: 0,
  };

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CHAT);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [initialWelcomeMessage];
  });

  // Local storage synchronization
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_DOCS, JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PLAN, JSON.stringify(plan));
  }, [plan]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REPORT, JSON.stringify(report));
  }, [report]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(messages));
  }, [messages]);

  // Aggregate active knowledge text
  const getActiveKnowledgeText = (): string => {
    return documents
      .filter((d) => d.isActive)
      .map((d) => `### [${d.category}] ${d.title}\n${d.content}`)
      .join('\n\n---\n\n');
  };

  // Sync knowledge from server so changes made by teacher are immediately reflected to all students in real-time
  useEffect(() => {
    const fetchLatestKnowledge = async () => {
      try {
        const res = await fetch('/api/knowledge');
        if (!res.ok) return;
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data && Array.isArray(data.documents) && data.documents.length > 0) {
            setDocuments(data.documents);
          }
        }
      } catch (err) {
        console.log('Knowledge fetch silent fallback:', err);
      }
    };

    // Initial fetch
    fetchLatestKnowledge();

    // Real-time polling every 10 seconds for students viewing the shared app
    const intervalId = setInterval(fetchLatestKnowledge, 10000);

    // Also re-fetch immediately whenever window gains focus
    const handleFocus = () => fetchLatestKnowledge();
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(intervalId);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Sync documents to server when changed by teacher
  const syncDocumentsToServer = async (updatedDocs: KnowledgeDocument[]) => {
    try {
      await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documents: updatedDocs }),
      });
    } catch (e) {
      console.error('Failed to sync documents to server:', e);
    }
  };

  // Send message to server with safe JSON error handling
  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          inquiryType,
          knowledgeContext: getActiveKnowledgeText(),
        }),
      });

      const contentType = response.headers.get('content-type');
      let data: any = null;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textResponse = await response.text();
        console.warn('Non-JSON response from server:', textResponse.slice(0, 100));
        data = { content: '응답 처리 중 일시적인 오류가 발생했습니다. 잠시 후 다시 질문해 주세요.' };
      }

      if (!response.ok) {
        throw new Error(data.error || `서버 상태 코드: ${response.status}`);
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.content || '응답을 받지 못했습니다.',
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: `일시적인 네트워크 지연이나 응답 오류가 발생했습니다 (${err.message || '다시 시도해주세요'}). 질문을 다시 한 번 전송해 주시면 친절히 답변해 드릴게요!`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Evaluate Draft (Plan or Report)
  const handleEvaluateDraft = async (
    type: 'plan' | 'report',
    draftData: any
  ): Promise<string> => {
    try {
      const response = await fetch('/api/evaluate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftType: type,
          draftData,
          knowledgeContext: getActiveKnowledgeText(),
        }),
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        return data.feedback || '피드백을 생성하지 못했습니다.';
      }
      return '피드백 생성 중 일시적인 통신 오류가 발생했습니다. 다시 시도해 주세요.';
    } catch (err: any) {
      return `피드백 생성 중 오류가 발생했습니다: ${err.message}`;
    }
  };

  // Knowledge handlers
  const handleAddDocument = (doc: Omit<KnowledgeDocument, 'id' | 'uploadedAt'>) => {
    const newDoc: KnowledgeDocument = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0],
    };
    const updated = [newDoc, ...documents];
    setDocuments(updated);
    syncDocumentsToServer(updated);
  };

  const handleToggleDocument = (id: string) => {
    const updated = documents.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d));
    setDocuments(updated);
    syncDocumentsToServer(updated);
  };

  const handleDeleteDocument = (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    syncDocumentsToServer(updated);
  };

  const handleResetDefaults = () => {
    if (confirm('개포고 기본 공식 문서 목록으로 복원하시겠습니까? 사용자 추가 문서는 보존됩니다.')) {
      const userDocs = documents.filter((d) => d.category === '사용자첨부');
      const updated = [...DEFAULT_KNOWLEDGE_DOCS, ...userDocs];
      setDocuments(updated);
      syncDocumentsToServer(updated);
    }
  };

  const handleClearChat = () => {
    // Directly clear messages and update local storage (confirmation already done in UI modal)
    setMessages([initialWelcomeMessage]);
    localStorage.removeItem(STORAGE_KEY_CHAT);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        inquiryType={inquiryType}
        knowledgeCount={documents.filter((d) => d.isActive).length}
        onOpenRubric={() => setIsRubricOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'chat' && (
          <ChatInterface
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            inquiryType={inquiryType}
            setInquiryType={setInquiryType}
            onNavigateToTab={setCurrentTab}
            onClearChat={handleClearChat}
          />
        )}

        {currentTab === 'roadmap' && (
          <StepRoadmap
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            inquiryType={inquiryType}
            setInquiryType={setInquiryType}
            selectedUnit={selectedUnit}
            setSelectedUnit={setSelectedUnit}
            onSendToChat={(prompt) => {
              setCurrentTab('chat');
              handleSendMessage(prompt);
            }}
            onNavigateToTab={setCurrentTab}
          />
        )}

        {currentTab === 'outline' && (
          <OutlineBuilder
            plan={plan}
            setPlan={setPlan}
            report={report}
            setReport={setReport}
            onEvaluateDraft={handleEvaluateDraft}
            onOpenRubric={() => setIsRubricOpen(true)}
          />
        )}

        {currentTab === 'knowledge' && (
          <KnowledgeManager
            documents={documents}
            onAddDocument={handleAddDocument}
            onToggleDocument={handleToggleDocument}
            onDeleteDocument={handleDeleteDocument}
            onResetDefaults={handleResetDefaults}
          />
        )}
      </main>

      {/* Official Rubric Modal */}
      <RubricModal isOpen={isRubricOpen} onClose={() => setIsRubricOpen(false)} />
    </div>
  );
}
