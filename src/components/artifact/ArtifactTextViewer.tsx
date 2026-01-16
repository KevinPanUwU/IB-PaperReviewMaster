import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { clsx } from 'clsx';

export const ArtifactTextViewer: React.FC = () => {
  const { draftText, analysisResult, activeHighlightId, setActiveHighlightId } = useAppStore();

  const renderedText = useMemo(() => {
    if (!analysisResult || !draftText) return <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800">{draftText}</p>;

    // Find all matches
    const matches: { start: number; end: number; id: number; type: string }[] = [];
    
    analysisResult.highlights.forEach(h => {
        const index = draftText.indexOf(h.quote);
        if (index !== -1) {
            matches.push({
                start: index,
                end: index + h.quote.length,
                id: h.id,
                type: h.type
            });
        }
    });

    // Sort matches
    matches.sort((a, b) => a.start - b.start);

    // Build segments
    const segments = [];
    let lastIndex = 0;

    matches.forEach((match, i) => {
        // Handle non-overlapping only for MVP
        if (match.start < lastIndex) return; // Skip overlapping

        // Text before match
        if (match.start > lastIndex) {
            segments.push(
                <span key={`text-${lastIndex}`}>
                    {draftText.slice(lastIndex, match.start)}
                </span>
            );
        }

        // Match
        segments.push(
            <span
                key={`highlight-${match.id}`}
                className={clsx(
                    "cursor-pointer transition-colors duration-200 rounded px-0.5",
                    match.type === 'positive' ? "bg-mint-glaze text-green-900" : "bg-coral-wash text-red-900",
                    activeHighlightId === match.id ? "ring-2 ring-offset-1 ring-current font-medium" : ""
                )}
                onMouseEnter={() => setActiveHighlightId(match.id)}
                onMouseLeave={() => setActiveHighlightId(null)}
            >
                {draftText.slice(match.start, match.end)}
                <sup className="text-[0.6em] font-bold ml-0.5 opacity-70">#{match.id}</sup>
            </span>
        );

        lastIndex = match.end;
    });

    // Remaining text
    if (lastIndex < draftText.length) {
        segments.push(
            <span key={`text-${lastIndex}`}>
                {draftText.slice(lastIndex)}
            </span>
        );
    }

    return <div className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800">{segments}</div>;
  }, [draftText, analysisResult, activeHighlightId, setActiveHighlightId]);

  return (
    <div className="h-full bg-paper-white overflow-y-auto p-8 flex justify-center">
      <div className="w-full max-w-3xl bg-white shadow-sm min-h-full p-12">
        {renderedText}
      </div>
    </div>
  );
};
