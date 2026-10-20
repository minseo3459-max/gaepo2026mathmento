/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from '@google/genai';
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { OutlineBuilder } from './components/OutlineBuilder.tsx';
import { KnowledgeManager } from './components/KnowledgeManager.tsx';
import { RubricModal } from './components/RubricModal.tsx';
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

// 로컬 저장소에서 지식 데이터를 동기화 (서버 요청 제거)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gaepo_knowledge_documents');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setDocuments(parsed);
          return;
        }
      }
      // 저장된 데이터가 없으면 기본 데이터 사용
      if (Array.isArray(DEFAULT_KNOWLEDGE_DOCS)) {
        setDocuments(DEFAULT_KNOWLEDGE_DOCS);
      }
    } catch (err) {
      console.log('Knowledge load fallback:', err);
    }
  }, []);

  // Sync documents to server when changed by teacher
  const syncDocumentsToServer = async (updatedDocs: KnowledgeDocument[]) => {
    try {
      localStorage.setItem('gaepo_knowledge_documents', JSON.stringify(updatedDocs));
    } catch (e) {
      console.error('Failed to sync documents to local storage:', e);
    }
  };

  // Evaluate Draft (Plan or Report)
// Evaluate Draft (Gemini 직접 호출 방식)
  const handleEvaluateDraft = async (
    type: 'plan' | 'report',
    draftData: any
  ): Promise<string> => {
    try {
      // 1. Vercel 환경 변수에서 API 키 로드
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API 키(VITE_GEMINI_API_KEY)가 설정되지 않았습니다.');
      }

      const ai = new GoogleGenAI({ apiKey });
      const knowledgeContext = getActiveKnowledgeText();

      // 2. 프롬프트 구성
      const prompt = `
당신은 개포고등학교 1차시 수학 탐구 ${type === 'plan' ? '계획서' : '보고서'} 평가 및 피드백 멘토입니다.
아래에 제공된 공식 루브릭(채점 기준)을 바탕으로 학생의 작성 내용을 꼼꼼하게 점검하고, 구체적이고 건설적인 피드백을 마크다운 형식으로 작성해 주세요.

[공식 루브릭 및 지식 베이스]
${knowledgeContext}

[학생 제출 내용]
${JSON.stringify(draftData, null, 2)}
`;

      // 3. Gemini 모델 실행
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: prompt,
      });

      return response.text || '피드백 결과를 생성하지 못했습니다.';
    } catch (e: any) {
      console.error('Failed to evaluate draft:', e);
      throw new Error(e.message || '피드백 생성 중 오류가 발생했습니다.');
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
