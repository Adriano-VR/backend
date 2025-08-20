import { FormAnalyticsDriver } from '../interfaces/form-analytics-driver.interface';
import { FormAnalyticsResult } from '../dto/form-analytics-result.dto';
import { answer, question } from '@prisma/client';

export class CopsoqAnalyticsDriver implements FormAnalyticsDriver {
  analyze(
    answers: answer[],
    questions: question[],
    submittedForms: any[],
    totalExpected: number,
  ): FormAnalyticsResult {
    // Agrupar perguntas por dimensão
    const dimensionsMap: Record<string, { scores: number[]; target: number }> =
      {};
    questions.forEach((q) => {
      if (!dimensionsMap[q.dimension]) {
        // Target pode ser mockado como 75 para todas as dimensões, ou customizado se disponível
        dimensionsMap[q.dimension] = { scores: [], target: 75 };
      }
    });
    // Associar respostas às dimensões
    answers.forEach((a) => {
      const question = questions.find((q) => q.id === a.questionId);
      if (question && dimensionsMap[question.dimension]) {
        // Suporta respostas numéricas (score)
        const value =
          typeof a.value === 'number' ? a.value : Number(a.value);
        if (!isNaN(value)) {
          dimensionsMap[question.dimension].scores.push(value);
        }
      }
    });
    // Calcular score, risk e target por dimensão
    const dimensions = Object.entries(dimensionsMap).map(
      ([name, { scores, target }]) => {
        const score = scores.length
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
        const risk = this.getRiskLevel(score);
        return {
          name,
          score,
          target,
          risk,
          answersCount: scores.length,
        };
      },
    );
    // Score geral (média das médias)
    const overallScore = dimensions.length
      ? dimensions.reduce((a, d) => a + d.score, 0) / dimensions.length
      : 0;

    // Calcular riskAlto: colaboradores (submittedForms) cuja média de respostas < 60
    // Agrupar answers por submittedFormId
    const answersByForm: Record<string, number[]> = {};
    answers.forEach((a) => {
      if (!a.submittedFormId) return;
      const value = typeof a.value === 'number' ? a.value : Number(a.value);
      if (!isNaN(value)) {
        if (!answersByForm[a.submittedFormId])
          answersByForm[a.submittedFormId] = [];
        answersByForm[a.submittedFormId].push(value);
      }
    });
    // Para cada grupo, calcular a média e contar quantos têm média < 60
    const riskAlto = Object.values(answersByForm).filter((scoresArr) => {
      if (!scoresArr.length) return false;
      const avg = scoresArr.reduce((a, b) => a + b, 0) / scoresArr.length;
      return avg < 60;
    }).length;

    // metaAtingida: % de dimensões com score >= target
    const metaAtingida = dimensions.length
      ? (dimensions.filter((d) => d.score >= d.target).length /
          dimensions.length) *
        100
      : 0;
    // participation: cálculo real
    let participation = 0;
    if (totalExpected > 0) {
      participation = (submittedForms.length / totalExpected) * 100;
    }
    return {
      overallScore,
      participation,
      riskAlto,
      metaAtingida,
      dimensions,
    };
  }

  private getRiskLevel(score: number): 'low' | 'medium' | 'high' {
    if (score < 60) return 'high';
    if (score < 75) return 'medium';
    return 'low';
  }
}
