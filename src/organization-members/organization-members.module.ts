import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OrganizationMemberRepository } from '../repositories/organization-member-repository';
import { PrismaOrganizationMemberRepository } from '../repositories/prisma/prisma-organization-member-repository';
import { QueryParserModule } from '../shared/query-parser/query-parser.module';
import { OrganizationMembersController } from './organization-members.controller';
import { OrganizationMembersService } from './organization-members.service';

@Module({
  imports: [PrismaModule, QueryParserModule],
  controllers: [OrganizationMembersController],
  providers: [
    OrganizationMembersService,
    {
      provide: OrganizationMemberRepository,
      useClass: PrismaOrganizationMemberRepository,
    },
  ],
  exports: [OrganizationMembersService, OrganizationMemberRepository],
})
export class OrganizationMembersModule {}
