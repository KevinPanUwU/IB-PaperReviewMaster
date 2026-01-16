import React, { useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { clsx } from 'clsx';

export const ArtifactTextViewer: React.FC = () => {
  const { draftText, analysisResult, activeHighlightId, setActiveHighlightId } = useAppStore();

  const renderedText = useMemo(() => {
    if (!analysisResult || !draftText) return <p className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800">{draftText}</p>;

    // Helper to clean text and keep mapping
    const cleanText = (text: string) => {
        const clean: string[] = [];
        const mapping: number[] = [];
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            // Keep only meaningful characters (Letters, Numbers, CJK). 
            // Strip whitespace (\s), Punctuation (\p{P}), and Symbols (\p{S}).
            // This ensures matches work even if punctuation differs (e.g. "," vs "，").
            if (/[^\s\p{P}\p{S}]/u.test(char)) {
                clean.push(char.toLowerCase());
                mapping.push(i);
            }
        }
        return { text: clean.join(''), mapping };
    };

    const { text: cleanDraft, mapping } = cleanText(draftText);

    // Find all matches
    const matches: { start: number; end: number; id: number; type: string }[] = [];
    
    analysisResult.highlights.forEach(h => {
        const { text: cleanQuote } = cleanText(h.quote);
        if (!cleanQuote) return;

        const cleanIndex = cleanDraft.indexOf(cleanQuote);
        
        if (cleanIndex !== -1) {
            // Map back to original indices
            const start = mapping[cleanIndex];
            // The end index in mapping corresponds to the last character of the match
            const end = mapping[cleanIndex + cleanQuote.length - 1] + 1;

            matches.push({
                start,
                end,
                id: h.id,
                type: h.type
            });
        } else {
            // Fallback: Try exact match if clean match fails
            const exactIndex = draftText.indexOf(h.quote);
            if (exactIndex !== -1) {
                matches.push({
                    start: exactIndex,
                    end: exactIndex + h.quote.length,
                    id: h.id,
                    type: h.type
                });
            }
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
                    match.type === 'positive' ? "bg-mint-glaze text-green-900" : 
                    match.type === 'negative' ? "bg-coral-wash text-red-900" : 
                    "bg-amber-glaze text-amber-900",
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
