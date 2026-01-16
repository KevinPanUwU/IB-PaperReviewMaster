import React, { useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Save, FileText, Image as ImageIcon } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { extractTextFromPDF } from '../../services/pdfProcessor';
import { clsx } from 'clsx';

export const DraftEditor: React.FC = () => {
  const { draftText, setDraftText, setPdfFile, setRubricFile, pdfFile, rubricFile } = useAppStore();
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const rubricInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setIsProcessing(true);
        try {
            const text = await extractTextFromPDF(file);
            setDraftText(text);
            setPdfFile(file);
        } catch (error) {
            console.error(error);
            setDraftText("Error extracting text from PDF.");
        } finally {
            setIsProcessing(false);
        }
    }
  };

  const handleRubricUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setRubricFile(file);
    }
  };

  const handleSave = () => {
    const doc = new jsPDF();
    
    // Split text to fit page width
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const maxLineWidth = pageWidth - (margin * 2);
    
    const splitText = doc.splitTextToSize(draftText, maxLineWidth);
    
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
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 justify-between items-center bg-gray-50 rounded-t-lg">
            <div className="flex items-center gap-6">
                <h2 className="font-serif font-bold text-gray-700">Draft Editor</h2>
                
                {/* Upload Work */}
                <div className="flex flex-col">
                    <input type="file" ref={pdfInputRef} className="hidden" accept=".pdf" onChange={handlePdfUpload} />
                    <button 
                        onClick={() => pdfInputRef.current?.click()}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        title={pdfFile ? pdfFile.name : "Upload PDF"}
                    >
                        <FileText className={clsx("w-4 h-4", pdfFile ? "text-mint-solid" : "text-gray-400")} />
                        <span className="truncate max-w-[150px] font-medium">{pdfFile ? pdfFile.name : "Upload Work"}</span>
                    </button>
                </div>

                {/* Upload Rubric */}
                <div className="flex flex-col">
                    <input type="file" ref={rubricInputRef} className="hidden" accept=".pdf,image/*" onChange={handleRubricUpload} />
                    <button 
                        onClick={() => rubricInputRef.current?.click()}
                        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                        title={rubricFile ? rubricFile.name : "Upload Rubric"}
                    >
                        <ImageIcon className={clsx("w-4 h-4", rubricFile ? "text-mint-solid" : "text-gray-400")} />
                        <span className="truncate max-w-[150px] font-medium">{rubricFile ? rubricFile.name : "Upload Rubric"}</span>
                    </button>
                </div>
            </div>

            <button 
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors shadow-sm text-sm"
            >
                <Save className="w-4 h-4" />
                Save & Update
            </button>
        </div>
        
        <div className="flex-1 relative">
            {isProcessing && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full" />
                        <p className="text-gray-600 font-medium">Extracting text...</p>
                    </div>
                </div>
            )}
            <textarea
              className="w-full h-full p-8 font-serif text-lg leading-relaxed resize-none focus:outline-none text-gray-800"
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              placeholder="Start writing or upload a PDF..."
            />
        </div>
      </div>
    </div>
  );
};
