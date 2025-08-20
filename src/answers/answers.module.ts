import { Module } from '@nestjs/common';
import { AnswersController } from './answers.controller';
import { AnswersService } from './answers.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AnswerRepository } from '../repositories/answer-repository';
import { PrismaAnswerRepository } from '../repositories/prisma/prisma-answer-repository';

@Module({
  imports: [PrismaModule],
  controllers: [AnswersController],
  providers: [
    AnswersService,
    {
      provide: AnswerRepository,
      useClass: PrismaAnswerRepository,
    },
  ],
  exports: [AnswersService, AnswerRepository],
})
export class AnswersModule {}
