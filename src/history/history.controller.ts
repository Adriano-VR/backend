import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { CreateHistoryDto } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('history')
@UseGuards(AuthGuard)
export class HistoryController {
  constructor(
    private readonly historyService: HistoryService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  async create(@Body() createHistoryDto: CreateHistoryDto) {
    return this.historyService.create(createHistoryDto);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateHistoryDto: UpdateHistoryDto,
  ) {
    return this.historyService.update(id, updateHistoryDto);
  }

  @Get('debug/profiles')
  async listProfiles() {
    return this.prisma.profile.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      where: {
        deletedAt: null,
      },
    });
  }

  @Get('profile/:profileId')
  async findByProfileId(@Param('profileId') profileId: string) {
    // Garante que retorna todos os tipos de histórico
    console.log(
      '[HistoryController] Recebida requisição para profileId:',
      profileId,
    );

    const result = await this.historyService.findByProfileId(profileId);

    console.log(
      '[HistoryController] Retornando resultado:',
      result.length,
      'registros',
    );
    console.log(
      '[HistoryController] Tipos retornados:',
      result.map((h) => h.type),
    );

    return result;
  }

  @Get('profile/:profileId/latest')
  async findLatestByProfileId(@Param('profileId') profileId: string) {
    return this.historyService.findLatestByProfileId(profileId);
  }
}
