import React, { useCallback, useRef } from 'react';
import { Upload, FileText, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { clsx } from 'clsx';
import { extractTextFromPDF } from '../../services/pdfProcessor';

export const UploadZone: React.FC = () => {
  const { setPdfFile, setRubricFile, pdfFile, rubricFile, setDraftText } = useAppStore();
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const rubricInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent, type: 'pdf' | 'rubric') => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (type === 'pdf' && file.type === 'application/pdf') {
        setPdfFile(file);
        extractTextFromPDF(file).then(text => setDraftText(text));
      } else if (type === 'rubric') {
        if (file.type.startsWith('image/') || file.type === 'application/pdf') {
            setRubricFile(file);
        }
      }
    }
  }, [setPdfFile, setRubricFile, setDraftText]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'pdf' | 'rubric') => {
    const file = e.target.files?.[0];
    if (file) {
        if (type === 'pdf') {
            setPdfFile(file);
            extractTextFromPDF(file).then(text => setDraftText(text));
        }
        if (type === 'rubric') setRubricFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-full bg-paper-white p-8 gap-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-serif font-bold text-gray-800">IB Paper Review Master</h1>
        <p className="text-gray-500 font-sans">Upload your work and rubric to begin the examination.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl h-[400px]">
        {/* PDF Drop Zone */}
        <div
          onDrop={(e) => handleDrop(e, 'pdf')}
          onDragOver={handleDragOver}
          onClick={() => pdfInputRef.current?.click()}
          className={clsx(
            "flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all duration-200 cursor-pointer",
            pdfFile ? "border-mint-solid bg-mint-glaze/10" : "border-gray-300 hover:border-gray-400 bg-white"
          )}
        >
          <input 
            type="file" 
            ref={pdfInputRef} 
            className="hidden" 
            accept=".pdf" 
            onChange={(e) => handleFileSelect(e, 'pdf')} 
          />
          <FileText className={clsx("w-16 h-16 mb-4", pdfFile ? "text-mint-solid" : "text-gray-400")} />
          <h3 className="text-lg font-semibold text-gray-700">
            {pdfFile ? pdfFile.name : "Drag or Click to Upload Work"}
          </h3>
          <p className="text-sm text-gray-500 mt-2">PDF files only</p>
        </div>

        {/* Rubric Drop Zone */}
        <div
          onDrop={(e) => handleDrop(e, 'rubric')}
          onDragOver={handleDragOver}
          onClick={() => rubricInputRef.current?.click()}
          className={clsx(
            "flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all duration-200 cursor-pointer",
            rubricFile ? "border-mint-solid bg-mint-glaze/10" : "border-gray-300 hover:border-gray-400 bg-white"
          )}
        >
          <input 
            type="file" 
            ref={rubricInputRef} 
            className="hidden" 
            accept=".pdf,image/png,image/jpeg,image/jpg" 
            onChange={(e) => handleFileSelect(e, 'rubric')} 
          />
          <ImageIcon className={clsx("w-16 h-16 mb-4", rubricFile ? "text-mint-solid" : "text-gray-400")} />
          <h3 className="text-lg font-semibold text-gray-700">
            {rubricFile ? rubricFile.name : "Drag or Click to Upload Rubric"}
          </h3>
          <p className="text-sm text-gray-500 mt-2">Images or PDF</p>
        </div>
      </div>
    </div>
  );
};
