import { create } from 'zustand';
import { AnalysisResult } from '../types';

interface AppState {
  pdfFile: File | null;
  rubricFile: File | null;
  viewMode: 'draft' | 'examiner';
  analysisResult: AnalysisResult | null;
  activeHighlightId: number | null;
  isAnalyzing: boolean;
  draftText: string;

  setPdfFile: (file: File | null) => void;
  setRubricFile: (file: File | null) => void;
  setViewMode: (mode: 'draft' | 'examiner') => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setActiveHighlightId: (id: number | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setDraftText: (text: string) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  pdfFile: null,
  rubricFile: null,
  viewMode: 'draft',
  analysisResult: null,
  activeHighlightId: null,
  isAnalyzing: false,
  draftText: "",

  setPdfFile: (file) => set({ pdfFile: file }),
  setRubricFile: (file) => set({ rubricFile: file }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setAnalysisResult: (result) => set({ analysisResult: result }),
  setActiveHighlightId: (id) => set({ activeHighlightId: id }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setDraftText: (text) => set({ draftText: text }),
  reset: () => set({
    pdfFile: null,
    rubricFile: null,
    viewMode: 'draft',
    analysisResult: null,
    activeHighlightId: null,
    isAnalyzing: false,
    draftText: ""
  }),
}));
