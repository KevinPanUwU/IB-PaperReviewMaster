import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useAppStore } from '../../store/useAppStore';
import { HighlightOverlay } from './HighlightOverlay';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

export const DocumentViewer: React.FC = () => {
  const { pdfFile } = useAppStore();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageDimensions, setPageDimensions] = useState<Record<number, any>>({});
  const [pageTextItems, setPageTextItems] = useState<Record<number, any[]>>({});

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  function onPageLoadSuccess(page: any) {
    const viewport = page.getViewport({ scale: 1 });
    setPageDimensions(prev => ({
      ...prev,
      [page.pageNumber]: { 
        width: 800, 
        height: viewport.height * (800 / viewport.width),
        originalWidth: viewport.width,
        originalHeight: viewport.height,
        viewBox: viewport.viewBox
      }
    }));

    page.getTextContent().then((textContent: any) => {
      setPageTextItems(prev => ({
        ...prev,
        [page.pageNumber]: textContent.items
      }));
    });
  }

  return (
    <div className="h-full bg-paper-white overflow-y-auto flex justify-center p-8">
      <div className="shadow-lg">
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex flex-col gap-8"
        >
          {Array.from(new Array(numPages), (el, index) => {
            const pageNumber = index + 1;
            return (
              <div key={`page_${pageNumber}`} className="relative">
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={true}
                  renderAnnotationLayer={false}
                  width={800}
                  onLoadSuccess={onPageLoadSuccess}
                  className="bg-white"
                />
                {pageDimensions[pageNumber] && (
                  <HighlightOverlay
                    pageNumber={pageNumber}
                    width={800}
                    height={pageDimensions[pageNumber].height}
                    originalWidth={pageDimensions[pageNumber].originalWidth}
                    originalHeight={pageDimensions[pageNumber].originalHeight}
                    viewBox={pageDimensions[pageNumber].viewBox}
                    textItems={pageTextItems[pageNumber]}
                  />
                )}
              </div>
            );
          })}
        </Document>
      </div>
    </div>
  );
};
