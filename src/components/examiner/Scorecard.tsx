import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { clsx } from 'clsx';

export const Scorecard: React.FC = () => {
  const { analysisResult } = useAppStore();

  if (!analysisResult) return null;

  return (
    <div className="sticky top-0 z-20 bg-[#F3F4F6]/95 backdrop-blur-sm border-b border-gray-200 p-6 shadow-sm transition-all">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estimated Grade</h2>
        <span className="text-4xl font-serif font-bold text-gray-900">{analysisResult.overall_grade}</span>
      </div>

      <div className="space-y-3">
        {analysisResult.criteria_breakdown.map((criterion) => (
          <div key={criterion.criterion} className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">Criterion {criterion.criterion}</span>
            <div className="flex items-center gap-3">
                {/* Simple visual indicator */}
                <div className={clsx(
                    "w-2 h-2 rounded-full transition-all duration-500",
                    // Mock logic for color based on score (assuming score is number-like)
                    !isNaN(parseInt(criterion.score)) && parseInt(criterion.score) >= 5 
                        ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" 
                        : "bg-amber-500"
                )} />
                <span className="text-gray-600 font-mono">{criterion.score}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
