import { IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { QuestionType } from '@prisma/client';
export { QuestionType };
export class CreateQuestionDto {
  @IsNotEmpty()
  @IsString()
  text: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  level: string;

  @IsNotEmpty()
  @IsString()
  dimension: string;

  @IsNotEmpty()
  @IsEnum(QuestionType)
  type: QuestionType;
}
