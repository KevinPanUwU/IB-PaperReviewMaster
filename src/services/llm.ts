import { AnalysisResult } from '../types';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = "google/gemini-3-flash-preview";

export const SYSTEM_PROMPT = `You are an expert International Baccalaureate Examiner. You are known for strict, criterion-referenced grading.
Input:
- The Student's Essay text.
- The Assessment Rubric text.

Task:
Analyze the text strictly against the rubric. You will identify specific sentences that either perfectly meet a standard or fail a standard.

Output Format:
You must respond ONLY in a valid JSON format with the following structure:
{
  "overall_grade": "X/Total",
  "criteria_breakdown": [
    {
      "criterion": "A", 
      "score": "X", 
      "reasoning": "Short reasoning...",
      "summary": "Detailed summary (~100 words) explaining the performance against this criterion."
    }
  ],
  "highlights": [
    {
      "id": 1,
      "quote": "text verbatim from document to match",
      "type": "positive", // or "negative" or "neutral"
      "criterion_related": "Criterion B",
      "feedback": "This analysis of the algorithm demonstrates high-level understanding...",
      "suggestion": "None" // or specific improvement
    }
  ]
}

Rules:
- 'Positive' highlights must be examples of perfect execution.
- 'Negative' highlights must be errors in logic, citation, or rubric failures.
- 'Neutral' highlights (Yellow) are for parts that are okay but "could be better" or need minor refinement.
- Be harsh but constructive.
- Ensure the 'quote' field matches the text in the document EXACTLY so it can be highlighted.`;

export async function analyzePaper(paperText: string, rubricText: string): Promise<AnalysisResult> {
  if (!API_KEY) {
    throw new Error("Missing API Key");
  }

  console.log("Sending request to OpenRouter...");

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "IB Paper Review Master",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `RUBRIC:\n${rubricText}\n\nSTUDENT PAPER:\n${paperText}` }
        ],
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    console.log("Received response from LLM");

    try {
      return JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse JSON:", content);
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error("Invalid JSON response from LLM");
    }
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
}

export async function cleanText(rawText: string): Promise<string> {
  if (!API_KEY) throw new Error("Missing API Key");

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "IB Paper Review Master",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { 
            role: "system", 
            content: `You are an expert text editor. Your task is to rewrite the provided text to fix all formatting issues caused by PDF extraction.

CRITICAL INSTRUCTIONS:
1. Remove ALL spaces between Chinese characters. (e.g., "那 团" -> "那团").
2. Merge broken lines and paragraphs into coherent blocks of text.
3. Remove unnecessary spaces in English text (e.g., "wo rd" -> "word").
4. Preserve the original meaning and content exactly, but you MUST rewrite the formatting to be sensible and clean.
5. Output ONLY the cleaned text.` 
          },
          { role: "user", content: rawText }
        ]
      })
    });

    if (!response.ok) throw new Error("API Error");
    const data = await response.json();
    let cleaned = data.choices[0].message.content;

    // Post-processing: Aggressively remove spaces between CJK characters
    // Using a broader range for CJK characters including punctuation and extensions
    const cjk = /([\u3000-\u303F\u4E00-\u9FFF\uFF00-\uFFEF])\s+([\u3000-\u303F\u4E00-\u9FFF\uFF00-\uFFEF])/g;
    
    // Run multiple times to handle overlapping matches (e.g. "A B C")
    cleaned = cleaned.replace(cjk, '$1$2');
    cleaned = cleaned.replace(cjk, '$1$2');

    return cleaned;
  } catch (error) {
    console.error("Text cleaning failed:", error);
    return rawText; // Fallback to raw text
  }
}
