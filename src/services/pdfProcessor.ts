import { pdfjs } from 'react-pdf';
// @ts-ignore
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.js?url';

// Ensure worker is set up
if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;
}

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(" ");
      fullText += pageText + "\n\n";
    }

    if (fullText.trim().length === 0) {
        return "Error: No text found in PDF. This might be a scanned document (image-only). Please upload a text-based PDF or convert this file using OCR software.";
    }

    return fullText;
  } catch (error) {
    console.error("Error extracting text from PDF:", error);
    throw error;
  }
}
