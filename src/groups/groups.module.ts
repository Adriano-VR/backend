import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GroupRepository } from '../repositories/group-repository';
import { OrganizationRepository } from '../repositories/organization-repositorie';
import { PrismaGroupRepository } from '../repositories/prisma/prisma-group-repositories';
import { PrismaOrganizationRepository } from '../repositories/prisma/prisma-organization-repositorie';
import { QueryParserModule } from '../shared/query-parser/query-parser.module';
import { GroupsController } from './groups.controller';
import { GroupsService } from './groups.service';

@Module({
  imports: [PrismaModule, QueryParserModule],
  controllers: [GroupsController],
  providers: [
    GroupsService,
    {
      provide: GroupRepository,
      useClass: PrismaGroupRepository,
    },
    {
      provide: OrganizationRepository,
      useClass: PrismaOrganizationRepository,
    },
  ],
  exports: [GroupsService, GroupRepository],
})
export class GroupsModule {}
