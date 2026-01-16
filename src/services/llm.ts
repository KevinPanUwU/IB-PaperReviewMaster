import { AnalysisResult } from '../types';

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = "google/gemini-2.0-flash-exp"; // Using a known supported model on OpenRouter or the one requested if available. 
// The user asked for "google/gemini-3-pro-preview". I will use that, but fallback to flash if it fails or if I should be safe.
// Actually, let's use the one requested.
const REQUESTED_MODEL = "google/gemini-2.0-flash-thinking-exp-1219"; // "google/gemini-3-pro-preview" might not be exact slug. 
// Checking common OpenRouter slugs... "google/gemini-pro-1.5" etc. 
// The user specifically said "google/gemini-3-pro-preview". I will use exactly that.
const TARGET_MODEL = "google/gemini-2.0-flash-thinking-exp-1219"; // I'll stick to a known working one or the user's exact string if I trust it.
// User said: "google/gemini-3-pro-preview". I will use it.
// Wait, "gemini-3" doesn't exist yet publicly as of my knowledge cutoff, but maybe it does in this future context (2026).
// I will use the user's string.

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
      "type": "positive", // or "negative"
      "criterion_related": "Criterion B",
      "feedback": "This analysis of the algorithm demonstrates high-level understanding...",
      "suggestion": "None" // or specific improvement
    }
  ]
}

Rules:
- 'Positive' highlights must be examples of perfect execution.
- 'Negative' highlights must be errors in logic, citation, or rubric failures.
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
        model: "google/gemini-3-pro-preview",
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
