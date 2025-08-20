import { Module } from '@nestjs/common';
import { QueryParserModule } from 'src/shared/query-parser/query-parser.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaProfileRepository } from '../repositories/prisma/prisma-profile-repositorie';
import { ProfileRepository } from '../repositories/profile-repositorie';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';

@Module({
  imports: [PrismaModule, QueryParserModule],
  controllers: [ProfilesController],
  providers: [
    ProfilesService,
    {
      provide: ProfileRepository,
      useClass: PrismaProfileRepository,
    },
  ],
  exports: [ProfilesService, ProfileRepository],
})
export class ProfilesModule {}
