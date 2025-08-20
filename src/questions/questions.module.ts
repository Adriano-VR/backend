import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaQuestionRepository } from '../repositories/prisma/prisma-question-repositorie';
import { QuestionRepository } from '../repositories/question-repositorie';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';

@Module({
  imports: [PrismaModule],
  controllers: [QuestionsController],
  providers: [
    QuestionsService,
    {
      provide: QuestionRepository,
      useClass: PrismaQuestionRepository,
    },
  ],
  exports: [QuestionsService, QuestionRepository],
})
export class QuestionsModule {}
