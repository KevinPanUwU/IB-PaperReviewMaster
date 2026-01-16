import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { clsx } from 'clsx';
import { PenTool, GraduationCap, RotateCcw, RefreshCw } from 'lucide-react';
import { analyzePaper } from '../../services/llm';
import { extractRubricText } from '../../services/rubricProcessor';
import { extractTextFromPDF } from '../../services/pdfProcessor';

export const AssessmentToggle: React.FC = () => {
  const { viewMode, setViewMode, isAnalyzing, setIsAnalyzing, setAnalysisResult, analysisResult, rubricFile, pdfFile, reset, draftText, analyzedText, setAnalyzedText } = useAppStore();

  const handleExaminerMode = async () => {
    if (viewMode === 'examiner') return;
    
    setViewMode('examiner');
    
    // Re-analyze if no result OR if the text has changed since last analysis
    if (!analysisResult || draftText !== analyzedText) {
        setIsAnalyzing(true);
        try {
            let rubricText = "Standard IB Rubric";
            if (rubricFile) {
                rubricText = await extractRubricText(rubricFile);
            }

            // Use draftText if available (it should be populated on upload)
            let paperText = draftText;
            if (!paperText && pdfFile) {
                paperText = await extractTextFromPDF(pdfFile);
            } else if (!paperText) {
                console.warn("No text available");
                paperText = "Mock Paper Text";
            }

            const result = await analyzePaper(paperText, rubricText);
            setAnalysisResult(result);
            setAnalyzedText(paperText);
        } catch (error) {
            console.error("Analysis failed", error);
        } finally {
            setIsAnalyzing(false);
        }
    }
  };

  const handleRegrade = async () => {
    if (isAnalyzing) return;
    setIsAnalyzing(true);
    try {
        let rubricText = "Standard IB Rubric";
        if (rubricFile) {
            rubricText = await extractRubricText(rubricFile);
        }
        
        const result = await analyzePaper(draftText, rubricText);
        setAnalysisResult(result);
        setAnalyzedText(draftText);
    } catch (error) {
        console.error("Re-analysis failed", error);
    } finally {
        setIsAnalyzing(false);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-3 z-50">
      <div className="bg-white shadow-lg rounded-full p-1 flex items-center border border-gray-200">
        <button
          onClick={() => setViewMode('draft')}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            viewMode === 'draft'
              ? "bg-gray-100 text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <PenTool className="w-4 h-4" />
          Draft Mode
        </button>
        <button
          onClick={handleExaminerMode}
          disabled={isAnalyzing}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
            viewMode === 'examiner'
              ? "bg-gray-900 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700",
            isAnalyzing && "opacity-50 cursor-not-allowed"
          )}
        >
          <GraduationCap className="w-4 h-4" />
          {isAnalyzing ? "Calibrating..." : "Examiner Mode"}
        </button>
      </div>

      {analysisResult && (
        <button
            onClick={handleRegrade}
            disabled={isAnalyzing}
            className={clsx(
                "bg-white shadow-lg rounded-full p-2.5 border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all",
                isAnalyzing && "animate-spin opacity-50"
            )}
            title="Regrade (Re-evaluate)"
        >
            <RefreshCw className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
