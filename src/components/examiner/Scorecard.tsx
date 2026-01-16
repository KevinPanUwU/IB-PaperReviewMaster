import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { clsx } from 'clsx';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const Scorecard: React.FC = () => {
  const { analysisResult } = useAppStore();
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null);

  if (!analysisResult) return null;

  return (
    <div className="sticky top-0 z-20 bg-[#F3F4F6]/95 backdrop-blur-sm border-b border-gray-200 p-6 shadow-sm transition-all">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Estimated Grade</h2>
        <span className="text-4xl font-serif font-bold text-gray-900">{analysisResult.overall_grade}</span>
      </div>

      <div className="space-y-3">
        {analysisResult.criteria_breakdown.map((criterion) => (
          <div key={criterion.criterion} className="flex flex-col gap-1">
            <div 
                className="flex items-center justify-between text-sm cursor-pointer hover:bg-gray-200/50 p-1.5 rounded transition-colors"
                onClick={() => setExpandedCriterion(expandedCriterion === criterion.criterion ? null : criterion.criterion)}
            >
                <span className="font-medium text-gray-700 flex items-center gap-2">
                    Criterion {criterion.criterion}
                    {expandedCriterion === criterion.criterion ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </span>
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        "w-2 h-2 rounded-full transition-all duration-500",
                        !isNaN(parseInt(criterion.score)) && parseInt(criterion.score) >= 5 
                            ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" 
                            : "bg-amber-500"
                    )} />
                    <span className="text-gray-600 font-mono">{criterion.score}</span>
                </div>
            </div>
            
            {expandedCriterion === criterion.criterion && (
                <div className="text-xs text-gray-600 bg-white p-3 rounded border border-gray-200 shadow-sm mb-2 animate-in slide-in-from-top-1 fade-in duration-200">
                    <p className="font-semibold mb-1 text-gray-800">Summary:</p>
                    {criterion.summary || criterion.reasoning}
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
