import { answer, question } from '@prisma/client';
import { FormAnalyticsResult } from '../dto/form-analytics-result.dto';

export interface FormAnalyticsDriver {
  analyze(
    answers: answer[],
    questions: question[],
    submittedForms: any[],
    totalExpected: number,
  ): FormAnalyticsResult;
}
