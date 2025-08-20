import { IsNotEmpty, IsUUID, IsJSON } from 'class-validator';

export class CreateAnswerDto {
  @IsUUID()
  questionId: string;

  @IsUUID()
  submittedFormId: string;

  @IsNotEmpty()
  answer: any;
}
