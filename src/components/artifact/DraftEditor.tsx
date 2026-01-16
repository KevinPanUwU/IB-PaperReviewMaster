import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Save } from 'lucide-react';
import { jsPDF } from 'jspdf';

export const DraftEditor: React.FC = () => {
  const { draftText, setDraftText, setPdfFile } = useAppStore();

  const handleSave = () => {
    const doc = new jsPDF();
    
    // Split text to fit page width
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxLineWidth = pageWidth - (margin * 2);
    
    const splitText = doc.splitTextToSize(draftText, maxLineWidth);
    
    // Add text to PDF (handling pagination automatically if possible, but jsPDF needs manual page add usually)
    // Simple version: just add text. If it overflows, it might be cut off.
    // Better: Loop and add pages.
    
    let cursorY = margin;
    const lineHeight = 7; // approx for default font size
    const pageHeight = doc.internal.pageSize.getHeight();
    
    splitText.forEach((line: string) => {
        if (cursorY + lineHeight > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
        }
        doc.text(line, margin, cursorY);
        cursorY += lineHeight;
    });

    const pdfBlob = doc.output('blob');
    const file = new File([pdfBlob], "edited-work.pdf", { type: "application/pdf" });
    
    // Update store with new PDF
    setPdfFile(file);
    
    // Download for user
    doc.save("edited-work.pdf");
  };

  return (
    <div className="h-full bg-paper-white p-8 flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-3xl bg-white shadow-sm h-full flex flex-col rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
            <h2 className="font-serif font-bold text-gray-700">Draft Editor</h2>
            <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors shadow-sm"
            >
                <Save className="w-4 h-4" />
                Save & Update PDF
            </button>
        </div>
        <textarea
          className="flex-1 w-full p-8 font-serif text-lg leading-relaxed resize-none focus:outline-none text-gray-800"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          placeholder="Start writing or upload a PDF..."
        />
      </div>
    </div>
  );
};
