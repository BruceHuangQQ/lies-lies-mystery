"use client";

import React, { createContext, useState, useContext } from 'react';
import type { CaseData } from './types/case';

interface CaseState {
  caseData: CaseData | null;
  story: string | null;
  caseId: string | null;
  setCaseData: (caseData: CaseData | null) => void;
  setStory: (story: string | null) => void;
  setCaseId: (caseId: string | null) => void;
}


const CaseContext = createContext<CaseState | undefined>(undefined);

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [story, setStory] = useState<string | null>(null);
  const [caseId, setCaseId] = useState<string | null>(null);

  return (
    <CaseContext.Provider
      value={{ caseData, story, caseId, setCaseData, setStory, setCaseId }}
    >
      {children}
    </CaseContext.Provider>
  );
}

export function useCase() {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error("useCase must be used within a CaseProvider");
  }
  return context;
}
