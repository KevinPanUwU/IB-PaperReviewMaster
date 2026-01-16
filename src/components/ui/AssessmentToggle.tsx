import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { clsx } from 'clsx';
import { PenTool, GraduationCap, RotateCcw, RefreshCw, Play } from 'lucide-react';
import { analyzePaper } from '../../services/llm';
import { extractRubricText } from '../../services/rubricProcessor';
import { extractTextFromPDF } from '../../services/pdfProcessor';

export const AssessmentToggle: React.FC = () => {
  const { viewMode, setViewMode, isAnalyzing, setIsAnalyzing, setAnalysisResult, analysisResult, rubricFile, pdfFile, reset, draftText, analyzedText, setAnalyzedText, setError, setStatusMessage } = useAppStore();
  const [loadingText, setLoadingText] = React.useState(".");

  React.useEffect(() => {
      if (isAnalyzing) {
          const interval = setInterval(() => {
              setLoadingText(prev => prev.length >= 3 ? "." : prev + ".");
          }, 500);
          return () => clearInterval(interval);
      }
  }, [isAnalyzing]);

  const handleExaminerMode = async () => {
    if (viewMode === 'examiner') return;
    setViewMode('examiner');
    // Auto-grading removed
  };

  const handleRegrade = async () => {
    if (isAnalyzing) return;

    setIsAnalyzing(true);
    setStatusMessage("Initializing...");
    setError(null);

    try {
        let rubricText = "Standard IB Rubric";
        if (rubricFile) {
            setStatusMessage("Extracting rubric text...");
            rubricText = await extractRubricText(rubricFile);
        }
        
        // Use draftText if available, else extract from PDF
        let paperText = draftText;
        if (!paperText && pdfFile) {
            setStatusMessage("Extracting paper text...");
            paperText = await extractTextFromPDF(pdfFile);
        } else if (!paperText) {
            console.warn("No text available");
            paperText = "Mock Paper Text";
        }

        if (paperText.startsWith("Error:")) {
            throw new Error(paperText);
        }

        setStatusMessage("Analyzing with AI...");
        const result = await analyzePaper(paperText, rubricText);
        setAnalysisResult(result);
        setAnalyzedText(paperText);
    } catch (error: any) {
        console.error("Analysis failed:", error);
        setError(error.message || "Analysis failed. Please try again.");
    } finally {
        setIsAnalyzing(false);
        setStatusMessage(null);
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
          Examiner Mode
        </button>
      </div>

      <button
        onClick={handleRegrade}
        disabled={isAnalyzing}
        className={clsx(
            "bg-white shadow-lg rounded-full p-2.5 border border-gray-200 text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-all flex items-center gap-2 px-4 min-w-[100px] justify-center",
            isAnalyzing && "opacity-80 cursor-wait"
        )}
        title={analysisResult ? "Regrade" : "Grade"}
      >
        {isAnalyzing ? (
            <span className="font-medium text-sm text-blue-600 animate-pulse">Grading{loadingText}</span>
        ) : (
            <>
                {analysisResult ? <RefreshCw className="w-5 h-5" /> : <Play className="w-5 h-5 text-green-600" />}
                <span className="font-medium text-sm hidden md:inline">{analysisResult ? "Regrade" : "Grade"}</span>
            </>
        )}
      </button>

      <button
        onClick={reset}
        className="bg-white shadow-lg rounded-full p-2.5 border border-gray-200 text-gray-500 hover:text-red-600 hover:border-red-200 transition-all"
        title="Reset and Upload New Files"
      >
        <RotateCcw className="w-5 h-5" />
      </button>
    </div>
  );
};
