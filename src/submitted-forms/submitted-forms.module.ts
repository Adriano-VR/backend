import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaSubmittedFormRepository } from '../repositories/prisma/prisma-submitted-form-repositorie';
import { SubmittedFormRepository } from '../repositories/submitted-form-repositorie';
import { SubmittedFormsController } from './submitted-forms.controller';
import { SubmittedFormsService } from './submitted-forms.service';

@Module({
  imports: [PrismaModule],
  controllers: [SubmittedFormsController],
  providers: [
    SubmittedFormsService,
    {
      provide: SubmittedFormRepository,
      useClass: PrismaSubmittedFormRepository,
    },
  ],
  exports: [SubmittedFormsService, SubmittedFormRepository],
})
export class SubmittedFormsModule {}
