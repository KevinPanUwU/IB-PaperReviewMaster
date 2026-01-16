import React, { useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Highlight } from '../../types';
import { clsx } from 'clsx';
import { motion } from 'framer-motion';

interface InsightCardProps {
  highlight: Highlight;
}

export const InsightCard: React.FC<InsightCardProps> = ({ highlight }) => {
  const { activeHighlightId, setActiveHighlightId } = useAppStore();
  const isActive = activeHighlightId === highlight.id;
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActive]);

  return (
    <motion.div
      ref={cardRef}
      layoutId={`card-${highlight.id}`}
      className={clsx(
        "bg-white rounded-lg p-5 border transition-all duration-300 cursor-pointer relative overflow-hidden",
        isActive
          ? highlight.type === 'positive'
            ? "border-mint-solid shadow-[0_4px_20px_-4px_rgba(34,197,94,0.3)] scale-[1.02] z-10"
            : highlight.type === 'negative'
                ? "border-coral-solid shadow-[0_4px_20px_-4px_rgba(244,63,94,0.3)] scale-[1.02] z-10"
                : "border-amber-solid shadow-[0_4px_20px_-4px_rgba(245,158,11,0.3)] scale-[1.02] z-10"
          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
      )}
      onMouseEnter={() => setActiveHighlightId(highlight.id)}
      onMouseLeave={() => setActiveHighlightId(null)}
    >
      {/* Left colored strip */}
      <div className={clsx(
          "absolute left-0 top-0 bottom-0 w-1",
          highlight.type === 'positive' ? "bg-mint-solid" : 
          highlight.type === 'negative' ? "bg-coral-solid" : "bg-amber-solid"
      )} />

      <div className="flex items-center justify-between mb-3 pl-2">
        <div className="flex items-center gap-2">
          <span className={clsx(
            "text-xs font-bold px-2 py-0.5 rounded-full border",
            highlight.type === 'positive' 
                ? "bg-mint-glaze text-green-800 border-green-200" 
                : highlight.type === 'negative'
                    ? "bg-coral-wash text-red-800 border-red-200"
                    : "bg-amber-glaze text-amber-800 border-amber-200"
          )}>
            #{highlight.id}
          </span>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {highlight.criterion_related}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-800 leading-relaxed mb-3 pl-2 font-medium">
        {highlight.feedback}
      </p>

      {highlight.suggestion && highlight.suggestion !== "None" && (
        <div className="ml-2 text-xs text-gray-600 bg-gray-50 p-3 rounded border border-gray-100 italic">
          <span className="font-semibold not-italic text-gray-500 block mb-1">Suggestion:</span> 
          {highlight.suggestion}
        </div>
      )}
    </motion.div>
  );
};
