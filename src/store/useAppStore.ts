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
  analyzedText: string | null;
  error: string | null;
  statusMessage: string | null;

  setPdfFile: (file: File | null) => void;
  setRubricFile: (file: File | null) => void;
  setViewMode: (mode: 'draft' | 'examiner') => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setActiveHighlightId: (id: number | null) => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setDraftText: (text: string) => void;
  setAnalyzedText: (text: string | null) => void;
  setError: (error: string | null) => void;
  setStatusMessage: (message: string | null) => void;
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
  analyzedText: null,
  error: null,
  statusMessage: null,

  setPdfFile: (file) => set({ pdfFile: file }),
  setRubricFile: (file) => set({ rubricFile: file }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setAnalysisResult: (result) => set({ analysisResult: result, error: null, statusMessage: null }),
  setActiveHighlightId: (id) => set({ activeHighlightId: id }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setDraftText: (text) => set({ draftText: text }),
  setAnalyzedText: (text) => set({ analyzedText: text }),
  setError: (error) => set({ error, statusMessage: null }),
  setStatusMessage: (message) => set({ statusMessage: message }),
  reset: () => set({
    pdfFile: null,
    rubricFile: null,
    viewMode: 'draft',
    analysisResult: null,
    activeHighlightId: null,
    isAnalyzing: false,
    draftText: "",
    analyzedText: null,
    error: null,
    statusMessage: null
  }),
}));
