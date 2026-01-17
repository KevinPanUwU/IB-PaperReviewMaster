import { create } from 'zustand';
import { AnalysisResult } from '../types';

interface AppState {
  pdfFile: File | null;
  rubricFile: File | null;
  viewMode: 'draft' | 'examiner';
  analysisResult: AnalysisResult | null;
  activeHighlightId: number | null;
  highlightSource: 'document' | 'feedback' | null;
  isAnalyzing: boolean;
  draftText: string;
  analyzedText: string | null;
  error: string | null;
  statusMessage: string | null;
  selectedModel: string;

  setPdfFile: (file: File | null) => void;
  setRubricFile: (file: File | null) => void;
  setViewMode: (mode: 'draft' | 'examiner') => void;
  setAnalysisResult: (result: AnalysisResult | null) => void;
  setActiveHighlightId: (id: number | null, source?: 'document' | 'feedback') => void;
  setIsAnalyzing: (isAnalyzing: boolean) => void;
  setDraftText: (text: string) => void;
  setAnalyzedText: (text: string | null) => void;
  setError: (error: string | null) => void;
  setStatusMessage: (message: string | null) => void;
  setSelectedModel: (model: string) => void;
  reset: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  pdfFile: null,
  rubricFile: null,
  viewMode: 'draft',
  analysisResult: null,
  activeHighlightId: null,
  highlightSource: null,
  isAnalyzing: false,
  draftText: "",
  analyzedText: null,
  error: null,
  statusMessage: null,
  selectedModel: "google/gemini-3-flash-preview",

  setPdfFile: (file) => set({ pdfFile: file }),
  setRubricFile: (file) => set({ rubricFile: file }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setAnalysisResult: (result) => set({ analysisResult: result, error: null, statusMessage: null }),
  setActiveHighlightId: (id, source = undefined) => set({ activeHighlightId: id, highlightSource: source || null }),
  setIsAnalyzing: (isAnalyzing) => set({ isAnalyzing }),
  setDraftText: (text) => set({ draftText: text }),
  setAnalyzedText: (text) => set({ analyzedText: text }),
  setError: (error) => set({ error, statusMessage: null }),
  setStatusMessage: (message) => set({ statusMessage: message }),
  setSelectedModel: (model) => set({ selectedModel: model }),
  reset: () => set({
    pdfFile: null,
    rubricFile: null,
    viewMode: 'draft',
    analysisResult: null,
    activeHighlightId: null,
    highlightSource: null,
    isAnalyzing: false,
    draftText: "",
    analyzedText: null,
    error: null,
    statusMessage: null,
    selectedModel: "google/gemini-3-flash-preview"
  }),
}));
