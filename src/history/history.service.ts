import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateHistoryDto, HistoryType } from './dto/create-history.dto';
import { UpdateHistoryDto } from './dto/update-history.dto';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async create(createHistoryDto: CreateHistoryDto) {
    return this.prisma.history.create({
      data: {
        profileId: createHistoryDto.profileId,
        type: createHistoryDto.type,
        data: createHistoryDto.data,
      },
    });
  }

  async update(id: string, updateHistoryDto: UpdateHistoryDto) {
    return this.prisma.history.update({
      where: { id },
      data: {
        ...(updateHistoryDto.type && { type: updateHistoryDto.type }),
        ...(updateHistoryDto.data && { data: updateHistoryDto.data }),
      },
    });
  }

  async findByProfileId(profileId: string) {
    // Retorna todos os tipos de histórico
    console.log(
      '[HistoryService] Buscando histórico para profileId:',
      profileId,
    );

    const result = await this.prisma.history.findMany({
      where: {
        profileId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    console.log(
      '[HistoryService] Resultado encontrado:',
      result.length,
      'registros',
    );
    console.log(
      '[HistoryService] Tipos encontrados:',
      result.map((h) => h.type),
    );
    console.log(
      '[HistoryService] Dados completos:',
      JSON.stringify(result, null, 2),
    );

    return result;
  }

  async findLatestByProfileId(profileId: string) {
    // Retorna o mais recente de qualquer tipo
    return this.prisma.history.findFirst({
      where: {
        profileId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
