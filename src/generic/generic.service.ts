import { BadRequestException, Injectable } from '@nestjs/common';
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

@Injectable()
export class GenericService {
  private repositoryMap: { [key: string]: any };

  constructor(
    private readonly profileRepository: PrismaProfileRepository,
    private readonly organizationRepository: PrismaOrganizationRepository,
    private readonly formRepository: PrismaFormRepository,
    private readonly submittedFormRepository: PrismaSubmittedFormRepository,
    private readonly questionRepository: PrismaQuestionRepository,
    private readonly departmentRepository: PrismaDepartmentRepository,
    private readonly groupRepository: PrismaGroupRepository,
    private readonly organizationMemberRepository: PrismaOrganizationMemberRepository,
    private readonly courseRepository: PrismaCourseRepository,
    private readonly answerRepository: PrismaAnswerRepository,
  ) {
    this.repositoryMap = {
      profiles: this.profileRepository,
      organizations: this.organizationRepository,
      forms: this.formRepository,
      submittedForms: this.submittedFormRepository,
      'submitted-forms': this.submittedFormRepository,
      questions: this.questionRepository,
      department: this.departmentRepository,
      groups: this.groupRepository,
      organizationMember: this.organizationMemberRepository,
      'organization-members': this.organizationMemberRepository,
      courses: this.courseRepository,
      answers: this.answerRepository,
    };
  }

  async count(entity: string, query?: any): Promise<number> {
    const repository = this.repositoryMap[entity];

    if (!repository) {
      console.log('Entidade não encontrada');
      throw new BadRequestException(
        `Entidade '${entity}' não encontrada. Entidades disponíveis: ${Object.keys(this.repositoryMap).join(', ')}`,
      );
    }

    const res = await repository.count(query);
    console.log(res, 'res-to-show');
    return res;
  }

  getAvailableEntities(): string[] {
    return Object.keys(this.repositoryMap);
  }
}
