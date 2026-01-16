import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { InsightCard } from './InsightCard';
import { Scorecard } from './Scorecard';

export const FeedbackStream: React.FC = () => {
  const { analysisResult, isAnalyzing } = useAppStore();

  if (isAnalyzing) {
    return (
        <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Calibrating Examiner...</p>
            <p className="text-sm text-gray-400 mt-2">Analyzing against rubric criteria</p>
        </div>
    )
  }

  if (!analysisResult) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center text-gray-400">
        <p>Switch to Examiner Mode to begin assessment.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-[#F3F4F6]">
      <Scorecard />
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {analysisResult.highlights.map((highlight) => (
          <InsightCard key={highlight.id} highlight={highlight} />
        ))}
        <div className="h-20" /> {/* Bottom spacer */}
      </div>
    </div>
  );
};
