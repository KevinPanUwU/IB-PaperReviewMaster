import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { clsx } from 'clsx';

interface HighlightOverlayProps {
  pageNumber: number;
  width: number;
  height: number;
  originalWidth?: number;
  originalHeight?: number;
  textItems?: any[];
  viewBox?: number[];
}

export const HighlightOverlay: React.FC<HighlightOverlayProps> = ({ 
    pageNumber, width, height, originalWidth, originalHeight, textItems, viewBox 
}) => {
  const { analysisResult, activeHighlightId, setActiveHighlightId, highlightSource } = useAppStore();
  const [highlightRects, setHighlightRects] = useState<any[]>([]);

  useEffect(() => {
    if (!analysisResult || !textItems || !originalWidth || !originalHeight) return;

    const rects: any[] = [];
    const scale = width / originalWidth;
    const minX = viewBox ? viewBox[0] : 0;
    const minY = viewBox ? viewBox[1] : 0;

    // 1. Build full page text and map items to indices
    let fullText = '';
    const itemMap: { start: number; end: number; index: number }[] = [];

    textItems.forEach((item, index) => {
      const normalized = item.str.replace(/\s+/g, '').toLowerCase();
      if (normalized.length === 0) return;

      const start = fullText.length;
      fullText += normalized;
      const end = fullText.length;

      itemMap.push({ start, end, index });
    });

    analysisResult.highlights.forEach(highlight => {
        // Normalize quote to remove whitespace issues for matching
        const normalizedQuote = highlight.quote.replace(/\s+/g, '').toLowerCase();
        if (!normalizedQuote) return;
        
        // Find all occurrences of the quote in the full text
        let searchIndex = 0;
        while (true) {
            const matchIndex = fullText.indexOf(normalizedQuote, searchIndex);
            if (matchIndex === -1) break;

            const matchEnd = matchIndex + normalizedQuote.length;

            // Find items that overlap with this match
            const involvedItems = itemMap.filter(m => 
                (m.start < matchEnd) && (m.end > matchIndex)
            );

            involvedItems.forEach(m => {
                const item = textItems[m.index];
                
                // Calculate overlap with this specific item
                const overlapStart = Math.max(m.start, matchIndex);
                const overlapEnd = Math.min(m.end, matchEnd);
                
                // Indices relative to the item's normalized string
                const itemRelStart = overlapStart - m.start;
                const itemRelEnd = overlapEnd - m.start;
                
                const normalizedItemLength = m.end - m.start;
                
                // Calculate horizontal slice ratios
                const startRatio = itemRelStart / normalizedItemLength;
                const endRatio = itemRelEnd / normalizedItemLength;
                const widthRatio = endRatio - startRatio;

                // item.transform is [scaleX, skewY, skewX, scaleY, x, y]
                const tx = item.transform;
                
                // PDF coordinates (0,0 is bottom-left)
                // Adjust for crop box (viewBox)
                const pdfX = tx[4] - minX;
                const pdfY = tx[5] - minY;
                
                const pdfHeight = item.height || Math.abs(tx[3]); // Approximation using font size
                const pdfWidth = item.width;

                // Calculate the specific slice of the item to highlight
                const sliceX = pdfX + (pdfWidth * startRatio);
                const sliceWidth = pdfWidth * widthRatio;

                // Convert to DOM coordinates (0,0 is top-left)
                const x = sliceX * scale;
                // Y needs to be flipped. 
                // pdfY is usually the baseline. We want the top of the box.
                const y = (originalHeight - pdfY) * scale - (pdfHeight * scale);
                
                const w = sliceWidth * scale;
                const h = pdfHeight * scale;

                rects.push({
                    id: highlight.id,
                    type: highlight.type,
                    style: {
                        left: `${x}px`,
                        top: `${y}px`,
                        width: `${w}px`,
                        height: `${h}px`
                    }
                });
            });

            // Continue searching for other occurrences of the same quote
            searchIndex = matchIndex + 1;
        }
    });

    setHighlightRects(rects);
  }, [analysisResult, textItems, originalWidth, originalHeight, width, viewBox]);

  useEffect(() => {
    if (activeHighlightId !== null && highlightSource === 'feedback') {
        const hasHighlight = highlightRects.some(r => r.id === activeHighlightId);
        if (hasHighlight) {
            const element = document.querySelector(`[data-highlight-id="${activeHighlightId}"]`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }
  }, [activeHighlightId, highlightRects, highlightSource]);

  if (!analysisResult) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ width, height }}>
      {highlightRects.map((rect, index) => (
        <div
          key={`${rect.id}-${index}`}
          data-highlight-id={rect.id}
          className={clsx(
            "absolute cursor-pointer pointer-events-auto transition-all duration-200 mix-blend-multiply rounded-sm",
            rect.type === 'positive' ? "bg-mint-glaze" : "bg-coral-wash",
            activeHighlightId === rect.id ? "opacity-100 border-b-2 border-current" : "opacity-40"
          )}
          style={rect.style}
          onMouseEnter={() => setActiveHighlightId(rect.id, 'document')}
          onMouseLeave={() => setActiveHighlightId(null)}
        />
      ))}
    </div>
  );
};
