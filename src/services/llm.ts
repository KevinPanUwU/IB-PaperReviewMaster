import { AnalysisResult } from '../types';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

//Do not change the SYSTEM_PROMPT at all. This is critical to ensure proper operation.
export const SYSTEM_PROMPT = `You are an expert International Baccalaureate Examiner. You are known for strict, criterion-referenced grading.
Input:
- The Student's Essay text.
- The Assessment Rubric text.

Task:
Analyze the text strictly against the rubric. You will identify specific sentences that relates to a standard, either failing it or supporting it. You should be identifying about 2-5 highlights per subpoint of a criterion, depending on the length of the text, this means that if there are 3 subpoint in an criteria, you should identify 6-15 highlights total for that criterion. You don't have try to equalize the amount of highlights for positive, negative or neutral.

Output Format:
You must respond ONLY in a valid JSON format with the following structure:
{
  "overall_grade": "X/Total",
  "criteria_breakdown": [
    {
      "criterion": "A", // or multiple criteria like "A, B", if provided criterion name, use the name directly from the rubric
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
- 'Positive' highlights must be examples of good execution.
- 'Negative' highlights must be errors in logic, citation, gone off topic, or rubric failures.
- 'Neutral' highlights (Yellow) are for parts that are okay but "could be better" or need minor refinement, like incomplete explanations or weak evidence, or misplaced paragraphs.
- You don't have to limit the length of the highlight quotes, but they should be relevant to the point being made. E.g. If you need it to be a whole paragraph to point out good execution, you are allowed to do so.
- Be objective, critical but constructive. You are not trying to please the student or critique them; you are providing an honest assessment.
- You can be stricter than a human examiner if the paper is subpar, to help them grow. But the grading should still be fair.
- Very importantly, examine the logic and check the authenicity of the data (if provided), check if they might be fake or miscalculated, or data between essays don't match.
- Ensure the 'quote' field matches the text in the document EXACTLY so it can be highlighted.`;

export async function analyzePaper(paperText: string, rubricText: string, model: string): Promise<AnalysisResult> {
  if (!API_KEY) {
    throw new Error("API Key is missing. Please ensure VITE_OPENROUTER_API_KEY is set in .env file.");
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 180000); // 180s timeout

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
        model: model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `RUBRIC:\n${rubricText}\n\nSTUDENT PAPER:\n${paperText}` }
        ],
        response_format: { type: "json_object" }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${response.status} - ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error("Invalid API response structure: Missing choices/message");
    }
    
    const content = data.choices[0].message.content;

    try {
      return JSON.parse(content);
    } catch (e: any) {
      console.error("Failed to parse JSON:", content);
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error(`Invalid JSON response: ${e.message}. Content snippet: ${content.substring(0, 100)}...`);
    }
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error("Analysis failed with error:", error);
    
    if (error.name === 'AbortError') {
        throw new Error("Request timed out after 180 seconds.");
    }
    if (error.message === 'Failed to fetch') {
        throw new Error("Network Error: Failed to connect to OpenRouter. Please check your internet connection.");
    }
    
    throw error;
  }
}

export async function cleanText(rawText: string, model: string): Promise<string> {
  if (!API_KEY) throw new Error("Missing API Key");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

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
        model: model,
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
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    let cleaned = data.choices[0].message.content;

    const cjk = /([\u3000-\u303F\u4E00-\u9FFF\uFF00-\uFFEF])\s+([\u3000-\u303F\u4E00-\u9FFF\uFF00-\uFFEF])/g;
    cleaned = cleaned.replace(cjk, '$1$2');
    cleaned = cleaned.replace(cjk, '$1$2');

    return cleaned;
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error("Text cleaning failed:", error);
    if (error.name === 'AbortError') {
        console.warn("Cleaning timed out, returning raw text");
    }
    return rawText; 
  }
}
