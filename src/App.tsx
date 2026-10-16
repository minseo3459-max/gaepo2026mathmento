/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { OutlineBuilder } from './components/OutlineBuilder.tsx';
import { KnowledgeManager } from './components/KnowledgeManager.tsx';
import { RubricModal } from './components/RubricModal.tsx';
import { DEFAULT_KNOWLEDGE_DOCS } from './data/defaultKnowledge.ts';
import {
  InquiryType,
  KnowledgeDocument,
  PlanDraft,
  ReportDraft,
} from './types/index.ts';

const STORAGE_KEY_DOCS = 'gaepo_math_knowledge_docs_v4';
const STORAGE_KEY_PLAN = 'gaepo_math_plan_draft_v4';
const STORAGE_KEY_REPORT = 'gaepo_math_report_draft_v4';

const isSampleData = (data: any): boolean => {
  if (!data) return false;
  const str = JSON.stringify(data);
  return (
    str.includes('OTT') ||
    str.includes('프로그래머') ||
    str.includes('세상을 바꾼') ||
    str.includes('직선의 방정식은 왜')
  );
};

export default function App() {
  const [currentTab, setCurrentTab] = useState<'outline' | 'knowledge'>('outline');
  const [isRubricOpen, setIsRubricOpen] = useState(false);

  // Clear legacy sample data keys on startup
  useEffect(() => {
    try {
      [
        'gaepo_math_plan_draft_v1',
        'gaepo_math_plan_draft_v2',
        'gaepo_math_plan_draft_v3',
        'gaepo_math_report_draft_v1',
        'gaepo_math_report_draft_v2',
        'gaepo_math_report_draft_v3',
        'gaepo_math_chat_history_v1',
        'gaepo_math_chat_history_v2',
        'gaepo_math_chat_history_v3',
      ].forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      console.error(e);
    }
  }, []);

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

  // 1차시 계획서 상태 (빈 양식으로 시작)
  const [plan, setPlan] = useState<PlanDraft>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLAN);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!isSampleData(parsed)) {
          return parsed;
        }
      }
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

  // 2차시 보고서 상태 (빈 양식으로 시작)
  const [report, setReport] = useState<ReportDraft>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REPORT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!isSampleData(parsed)) {
          return parsed;
        }
      }
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

  // Aggregate active knowledge text
  const getActiveKnowledgeText = (): string => {
    return documents
      .filter((d) => d.isActive)
      .map((d) => `### [${d.category}] ${d.title}\n${d.content}`)
      .join('\n\n---\n\n');
  };

  // Sync knowledge from server so changes made by teacher are immediately reflected
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

    fetchLatestKnowledge();
    const intervalId = setInterval(fetchLatestKnowledge, 10000);

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        inquiryType={plan.inquiryType}
        knowledgeCount={documents.filter((d) => d.isActive).length}
        onOpenRubric={() => setIsRubricOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
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
