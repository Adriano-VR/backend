import { Module } from '@nestjs/common';
import { PrismaProfileRepository } from 'src/repositories/prisma/prisma-profile-repositorie';
import { ProfileRepository } from 'src/repositories/profile-repositorie';
import { PrismaModule } from '../prisma/prisma.module';
import { OrganizationRepository } from '../repositories/organization-repositorie';
import { PrismaOrganizationRepository } from '../repositories/prisma/prisma-organization-repositorie';
import { OrganizationMemberRepository } from '../repositories/organization-member-repository';
import { PrismaOrganizationMemberRepository } from '../repositories/prisma/prisma-organization-member-repository';
import { QueryParserModule } from '../shared/query-parser/query-parser.module';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

@Module({
  imports: [PrismaModule, QueryParserModule],
  controllers: [OrganizationsController],
  providers: [
    OrganizationsService,
    {
      provide: OrganizationRepository,
      useClass: PrismaOrganizationRepository,
    },
    {
      provide: OrganizationMemberRepository,
      useClass: PrismaOrganizationMemberRepository,
    },
    {
      provide: ProfileRepository,
      useClass: PrismaProfileRepository,
    },
  ],
  exports: [OrganizationsService, OrganizationRepository],
})
export class OrganizationsModule {}
