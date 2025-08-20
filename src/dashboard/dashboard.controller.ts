import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('summary')
  async getSummary() {
    const count = await this.prisma.profile.count();
    return { hasAnyRecord: count > 0 };
  }
}
