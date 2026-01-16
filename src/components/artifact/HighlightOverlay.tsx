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
  const { analysisResult, activeHighlightId, setActiveHighlightId } = useAppStore();
  const [highlightRects, setHighlightRects] = useState<any[]>([]);

  useEffect(() => {
    if (!analysisResult || !textItems || !originalWidth || !originalHeight) return;

    const rects: any[] = [];
    const scale = width / originalWidth;
    const minX = viewBox ? viewBox[0] : 0;
    const minY = viewBox ? viewBox[1] : 0;

    analysisResult.highlights.forEach(highlight => {
        // Normalize quote to remove whitespace issues for matching
        const normalizedQuote = highlight.quote.replace(/\s+/g, '').toLowerCase();
        
        textItems.forEach(item => {
            const normalizedItem = item.str.replace(/\s+/g, '').toLowerCase();
            
            // Filter out very short items to avoid noise, unless the quote itself is short
            if (normalizedItem.length < 3) return;

            if (normalizedQuote.includes(normalizedItem)) {
                // Found a match (partially)
                // item.transform is [scaleX, skewY, skewX, scaleY, x, y]
                const tx = item.transform;
                
                // PDF coordinates (0,0 is bottom-left)
                // Adjust for crop box (viewBox)
                const pdfX = tx[4] - minX;
                const pdfY = tx[5] - minY;
                
                const pdfHeight = item.height || Math.abs(tx[3]); // Approximation using font size
                const pdfWidth = item.width;

                // Convert to DOM coordinates (0,0 is top-left)
                const x = pdfX * scale;
                // Y needs to be flipped. 
                // pdfY is usually the baseline. We want the top of the box.
                const y = (originalHeight - pdfY) * scale - (pdfHeight * scale);
                
                const w = pdfWidth * scale;
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
            }
        });
    });

    setHighlightRects(rects);
  }, [analysisResult, textItems, originalWidth, originalHeight, width, viewBox]);

  if (!analysisResult) return null;

  return (
    <div className="absolute inset-0 pointer-events-none" style={{ width, height }}>
      {highlightRects.map((rect, index) => (
        <div
          key={`${rect.id}-${index}`}
          className={clsx(
            "absolute cursor-pointer pointer-events-auto transition-all duration-200 mix-blend-multiply rounded-sm",
            rect.type === 'positive' ? "bg-mint-glaze" : "bg-coral-wash",
            activeHighlightId === rect.id ? "opacity-100 border-b-2 border-current" : "opacity-40"
          )}
          style={rect.style}
          onMouseEnter={() => setActiveHighlightId(rect.id)}
          onMouseLeave={() => setActiveHighlightId(null)}
        />
      ))}
    </div>
  );
};
