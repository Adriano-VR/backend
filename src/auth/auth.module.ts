import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { ConfigService } from '@nestjs/config';
import { OrganizationMemberRepository } from 'src/repositories/organization-member-repository';
import { OrganizationRepository } from 'src/repositories/organization-repositorie';
import { PrismaOrganizationMemberRepository } from 'src/repositories/prisma/prisma-organization-member-repository';
import { PrismaOrganizationRepository } from 'src/repositories/prisma/prisma-organization-repositorie';
import { PrismaProfileRepository } from 'src/repositories/prisma/prisma-profile-repositorie';
import { ProfileRepository } from 'src/repositories/profile-repositorie';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseModule } from '../supabase/supabase.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';

if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET is not set');
}

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    EmailModule,
    SupabaseModule,

    JwtModule.registerAsync({
      global: true,
      imports: [],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '1d',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    PrismaService,
    {
      provide: ProfileRepository,
      useClass: PrismaProfileRepository,
    },
    {
      provide: OrganizationMemberRepository,
      useClass: PrismaOrganizationMemberRepository,
    },
    {
      provide: OrganizationRepository,
      useClass: PrismaOrganizationRepository,
    },
  ],
})
export class AuthModule {}
