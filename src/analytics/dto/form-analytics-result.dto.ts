export interface FormAnalyticsResult {
  overallScore: number;
  participation: number; // porcentagem
  riskAlto: number; // quantidade de colaboradores com score < 60
  metaAtingida: number; // % de dimensões com score >= target
  dimensions: Array<{
    name: string;
    score: number;
    target: number;
    risk: 'low' | 'medium' | 'high';
    answersCount: number;
  }>;
}

export {};
