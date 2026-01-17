import React, { useRef, useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { FileText, Image as ImageIcon, Wand2 } from 'lucide-react';
import { extractTextFromPDF } from '../../services/pdfProcessor';
import { cleanText } from '../../services/llm';
import { clsx } from 'clsx';

export const DraftEditor: React.FC = () => {
  const { draftText, setDraftText, setPdfFile, setRubricFile, pdfFile, rubricFile, analysisResult, activeHighlightId, setActiveHighlightId, selectedModel, setSelectedModel, highlightSource } = useAppStore();
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const rubricInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const isTypingRef = useRef(false);

  // Helper to clean text and keep mapping
  const cleanTextHelper = (text: string) => {
      const clean: string[] = [];
      const mapping: number[] = [];
      for (let i = 0; i < text.length; i++) {
          const char = text[i];
          if (/[\p{L}\p{N}]/u.test(char)) {
              clean.push(char.toLowerCase());
              mapping.push(i);
          }
      }
      return { text: clean.join(''), mapping };
  };

  const generateHtml = () => {
      if (!draftText) return "";
      if (!analysisResult) return draftText; // Plain text if no analysis

      const { text: cleanDraft, mapping } = cleanTextHelper(draftText);
      const matches: { start: number; end: number; id: number; type: string }[] = [];

      analysisResult.highlights.forEach(h => {
          const { text: cleanQuote } = cleanTextHelper(h.quote);
          if (!cleanQuote) return;
          const cleanIndex = cleanDraft.indexOf(cleanQuote);
          if (cleanIndex !== -1) {
              const start = mapping[cleanIndex];
              const end = mapping[cleanIndex + cleanQuote.length - 1] + 1;
              matches.push({ start, end, id: h.id, type: h.type });
          } else {
              const exactIndex = draftText.indexOf(h.quote);
              if (exactIndex !== -1) {
                  matches.push({ start: exactIndex, end: exactIndex + h.quote.length, id: h.id, type: h.type });
              }
          }
      });
      matches.sort((a, b) => a.start - b.start);

      let html = "";
      let lastIndex = 0;

      matches.forEach((match) => {
          if (match.start < lastIndex) return;
          if (match.start > lastIndex) {
              html += draftText.slice(lastIndex, match.start);
          }
          
          let classes = "rounded px-0.5 transition-colors duration-200 ";
          if (match.type === 'positive') classes += "bg-green-100 ";
          else if (match.type === 'negative') classes += "bg-red-100 ";
          else classes += "bg-yellow-100 ";
          
          if (activeHighlightId === match.id) classes += "ring-2 ring-offset-1 ring-current ";

          html += `<span class="${classes}" data-highlight-id="${match.id}">${draftText.slice(match.start, match.end)}</span>`;
          lastIndex = match.end;
      });

      if (lastIndex < draftText.length) {
          html += draftText.slice(lastIndex);
      }

      return html;
  };

  // Update HTML when analysis changes or external text update
  useEffect(() => {
      if (isTypingRef.current) return;
      
      if (editorRef.current) {
          // Only update if text content differs significantly (e.g. upload) or if we have new highlights
          // Simple check: if innerText != draftText, it's an external update.
          // If innerText == draftText, but analysisResult changed, we need to re-render HTML.
          
          // We can just always update if not typing.
          editorRef.current.innerHTML = generateHtml();

          // Scroll to active highlight if exists
          if (activeHighlightId !== null && highlightSource === 'feedback') {
              const element = editorRef.current.querySelector(`[data-highlight-id="${activeHighlightId}"]`);
              if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
          }
      }
  }, [draftText, analysisResult, activeHighlightId, highlightSource]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
      isTypingRef.current = true;
      const newText = e.currentTarget.innerText;
      if (newText !== draftText) {
          setDraftText(newText);
      }
      // Reset typing flag after a delay to allow external updates again if needed
      setTimeout(() => { isTypingRef.current = false; }, 1000);
  };

  const handleMouseOver = (e: React.MouseEvent) => {
      const target = e.target as HTMLElement;
      const id = target.getAttribute('data-highlight-id');
      if (id) setActiveHighlightId(parseInt(id), 'document');
  };
  const handleMouseOut = () => setActiveHighlightId(null);

  // ... Upload/Save handlers (same as before) ...
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

  const handleCleanup = async () => {
    if (!draftText) return;
    setIsProcessing(true);
    try {
        const cleaned = await cleanText(draftText, selectedModel);
        setDraftText(cleaned);
    } catch (error) {
        console.error("Cleanup failed", error);
    } finally {
        setIsProcessing(false);
    }
  };

  const handleRubricUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setRubricFile(file);
    }
  };

  return (
    <div className="h-full bg-paper-white p-8 flex flex-col items-center overflow-hidden">
      <div className="w-full max-w-3xl bg-white shadow-sm h-full flex flex-col rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 justify-between items-center bg-gray-50 rounded-t-lg">
            <div className="flex items-center gap-6">
                <h2 className="font-serif font-bold text-gray-700">Draft Editor</h2>
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
            <div className="flex items-center gap-3">
                <button 
                    onClick={handleCleanup}
                    disabled={isProcessing || !draftText}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-600 rounded-md hover:bg-gray-50 hover:text-purple-600 hover:border-purple-200 transition-colors shadow-sm text-sm"
                    title="Fix formatting and spacing with AI"
                >
                    <Wand2 className="w-4 h-4" />
                    Cleanup
                </button>
                <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="px-3 py-2 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm text-sm max-w-[200px]"
                >
                    <option value="google/gemini-3-pro-preview">Gemini 3 Pro</option>
                    <option value="google/gemini-3-flash-preview">Gemini 3 Flash</option>
                    <option value="xiaomi/mimo-v2-flash:free">Mimo V2 Flash</option>
                </select>
            </div>
        </div>
        
        <div className="flex-1 relative overflow-y-auto p-8">
            <div
                ref={editorRef}
                className="w-full min-h-full font-serif text-lg leading-relaxed text-gray-800 outline-none whitespace-pre-wrap"
                contentEditable
                suppressContentEditableWarning
                onInput={handleInput}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
            />
            {isProcessing && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-20 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-3">
                        <div className="animate-spin w-8 h-8 border-4 border-gray-200 border-t-gray-800 rounded-full" />
                        <p className="text-gray-600 font-medium">Processing text...</p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};
