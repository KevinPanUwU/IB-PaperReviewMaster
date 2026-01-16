export interface Highlight {
  id: number;
  quote: string;
  type: 'positive' | 'negative';
  criterion_related: string;
  feedback: string;
  suggestion: string;
}

export interface CriterionScore {
  criterion: string;
  score: string;
  reasoning: string;
}

export interface AnalysisResult {
  overall_grade: string;
  criteria_breakdown: CriterionScore[];
  highlights: Highlight[];
}
