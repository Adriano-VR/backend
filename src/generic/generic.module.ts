import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaAnswerRepository } from '../repositories/prisma/prisma-answer-repository';
import { PrismaCourseRepository } from '../repositories/prisma/prisma-course-repositorie';
import { PrismaDepartmentRepository } from '../repositories/prisma/prisma-department-repositorie';
import { PrismaFormRepository } from '../repositories/prisma/prisma-form-repositorie';
import { PrismaGroupRepository } from '../repositories/prisma/prisma-group-repositories';
import { PrismaOrganizationMemberRepository } from '../repositories/prisma/prisma-organization-member-repository';
import { PrismaOrganizationRepository } from '../repositories/prisma/prisma-organization-repositorie';
import { PrismaProfileRepository } from '../repositories/prisma/prisma-profile-repositorie';
import { PrismaQuestionRepository } from '../repositories/prisma/prisma-question-repositorie';
import { PrismaSubmittedFormRepository } from '../repositories/prisma/prisma-submitted-form-repositorie';
import { GenericController } from './generic.controller';
import { GenericService } from './generic.service';

@Module({
  imports: [PrismaModule],
  controllers: [GenericController],
  providers: [
    GenericService,
    PrismaProfileRepository,
    PrismaOrganizationRepository,
    PrismaFormRepository,
    PrismaSubmittedFormRepository,
    PrismaQuestionRepository,
    PrismaDepartmentRepository,
    PrismaGroupRepository,
    PrismaOrganizationMemberRepository,
    PrismaCourseRepository,
    PrismaAnswerRepository,
  ],
  exports: [GenericService],
})
export class GenericModule {}
