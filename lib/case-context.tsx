"use client";

import React, { createContext, useState, useContext } from 'react';
import type { CaseData } from './types/case';

interface CaseState {
  caseData: CaseData | null;
  story: string | null;
  actionsRemaining: number;
  setCaseData: (caseData: CaseData | null) => void;
  setStory: (story: string | null) => void;
  decrementAction: () => void;
  resetActions: () => void;
}

const MAX_ACTIONS = 2;

const CaseContext = createContext<CaseState | undefined>(undefined);

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [story, setStory] = useState<string | null>(null);
  const [actionsRemaining, setActionsRemaining] = useState<number>(MAX_ACTIONS);

  const decrementAction = () => {
    setActionsRemaining((prev) => Math.max(0, prev - 1));
  };

  const resetActions = () => {
    setActionsRemaining(MAX_ACTIONS);
  };


  return (
    <CaseContext.Provider value={{ caseData, story, setCaseData, setStory, actionsRemaining, decrementAction, resetActions }}>
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
