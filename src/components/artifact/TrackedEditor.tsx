import React, { useMemo, useRef, useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { clsx } from 'clsx';
import DiffMatchPatch from 'diff-match-patch';

export const TrackedEditor: React.FC = () => {
  const { draftText, setDraftText, analyzedText, analysisResult, activeHighlightId, setActiveHighlightId } = useAppStore();
  const editorRef = useRef<HTMLDivElement>(null);
  const [htmlContent, setHtmlContent] = useState('');
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const [version, setVersion] = useState(0);

  // Helper to clean text and keep mapping
  const cleanText = (text: string) => {
      const clean: string[] = [];
      const mapping: number[] = [];
      for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (/[^\s\p{P}\p{S}]/u.test(char)) {
              clean.push(char.toLowerCase());
              mapping.push(i);
          }
      }
      return { text: clean.join(''), mapping };
  };

  // Generate HTML from Diff + Highlights
  useEffect(() => {
    // Don't update while user is actively typing to avoid cursor jumps
    if (isTypingRef.current) return;

    if (!draftText) {
        setHtmlContent('');
        return;
    }

    const dmp = new DiffMatchPatch();
    const diffs = dmp.diff_main(analyzedText || "", draftText);
    dmp.diff_cleanupSemantic(diffs);

    let html = '';
    let originalIndex = 0;

    const { text: cleanAnalyzed, mapping: analyzedMapping } = cleanText(analyzedText || "");
    
    // Pre-calculate highlight ranges on analyzedText
    const highlightRanges: { start: number; end: number; id: number; type: string }[] = [];
    if (analysisResult && analyzedText) {
        analysisResult.highlights.forEach(h => {
            const { text: cleanQuote } = cleanText(h.quote);
            if (!cleanQuote) return;
            const cleanIndex = cleanAnalyzed.indexOf(cleanQuote);
            if (cleanIndex !== -1) {
                const start = analyzedMapping[cleanIndex];
                const end = analyzedMapping[cleanIndex + cleanQuote.length - 1] + 1;
                highlightRanges.push({ start, end, id: h.id, type: h.type });
            } else {
                const exactIndex = analyzedText.indexOf(h.quote);
                if (exactIndex !== -1) {
                    highlightRanges.push({ start: exactIndex, end: exactIndex + h.quote.length, id: h.id, type: h.type });
                }
            }
        });
    }
    highlightRanges.sort((a, b) => a.start - b.start);

    diffs.forEach((diff) => {
        const [type, text] = diff;
        // type: 0 (equal), 1 (insert), -1 (delete)

        if (type === 1) { // Insert
            html += `<span class="bg-pink-200 text-gray-800">${text}</span>`;
        } else if (type === -1) { // Delete
            html += `<span class="line-through text-gray-400 decoration-gray-400 select-none bg-gray-100" contenteditable="false">${text}</span>`;
            originalIndex += text.length;
        } else { // Equal
            const segmentEnd = originalIndex + text.length;
            
            // Slice by highlights
            const relevantHighlights = highlightRanges.filter(h => h.end > originalIndex && h.start < segmentEnd);
            const cuts = new Set<number>();
            cuts.add(originalIndex);
            cuts.add(segmentEnd);
            relevantHighlights.forEach(h => {
                if (h.start > originalIndex && h.start < segmentEnd) cuts.add(h.start);
                if (h.end > originalIndex && h.end < segmentEnd) cuts.add(h.end);
            });
            const sortedCuts = Array.from(cuts).sort((a, b) => a - b);
            
            for (let i = 0; i < sortedCuts.length - 1; i++) {
                const start = sortedCuts[i];
                const end = sortedCuts[i+1];
                const subText = analyzedText!.slice(start, end);
                
                const activeH = relevantHighlights.find(h => h.start <= start && h.end >= end);
                
                let classes = "";
                if (activeH) {
                    classes += "cursor-pointer transition-colors duration-200 rounded px-0.5 ";
                    if (activeH.type === 'positive') classes += "bg-mint-glaze text-green-900 ";
                    else if (activeH.type === 'negative') classes += "bg-coral-wash text-red-900 ";
                    else classes += "bg-amber-glaze text-amber-900 ";
                    
                    if (activeHighlightId === activeH.id) classes += "ring-2 ring-offset-1 ring-current font-medium ";
                }

                if (activeH) {
                    html += `<span class="${classes}" data-highlight-id="${activeH.id}">${subText}</span>`;
                } else {
                    html += subText;
                }
            }
            originalIndex += text.length;
        }
    });

    setHtmlContent(html);
  }, [draftText, analyzedText, analysisResult, activeHighlightId, version]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      isTypingRef.current = true;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

      const getText = (node: Node): string => {
          if (node.nodeType === Node.TEXT_NODE) return node.textContent || "";
          if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              if (el.classList.contains('line-through')) return ""; // Skip deleted text
              let str = "";
              el.childNodes.forEach(child => str += getText(child));
              return str;
          }
          return "";
      };
      
      const newText = getText(e.currentTarget);
      if (newText !== draftText) {
          setDraftText(newText);
      }

      // Debounce re-render to allow typing to finish
      typingTimeoutRef.current = setTimeout(() => {
          isTypingRef.current = false;
          setVersion(v => v + 1);
      }, 1000);
  };

  // Handle highlight hover via delegation
  const handleMouseOver = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const id = target.getAttribute('data-highlight-id');
      if (id) setActiveHighlightId(parseInt(id));
  };
  const handleMouseOut = () => setActiveHighlightId(null);

  return (
    <div className="h-full bg-paper-white overflow-y-auto p-8 flex justify-center pb-32">
      <div className="w-full max-w-3xl bg-white shadow-sm min-h-[80vh] h-fit p-12">
        <div
            ref={editorRef}
            className="whitespace-pre-wrap font-serif text-lg leading-relaxed text-gray-800 outline-none"
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>
    </div>
  );
};
