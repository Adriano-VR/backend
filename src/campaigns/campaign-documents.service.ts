import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateCampaignDocumentDto {
  name: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  campaignId: string;
}

export interface UpdateCampaignDocumentDto {
  name?: string;
  description?: string;
}

@Injectable()
export class CampaignDocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDocumentDto: CreateCampaignDocumentDto, userId: string) {
    return this.prisma.campaignDocument.create({
      data: {
        ...createDocumentDto,
        uploadedById: userId,
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(campaignId?: string) {
    return this.prisma.campaignDocument.findMany({
      where: {
        campaignId,
        deletedAt: null,
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const document = await this.prisma.campaignDocument.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!document) {
      throw new NotFoundException('Documento não encontrado');
    }

    return document;
  }

  async update(id: string, updateDocumentDto: UpdateCampaignDocumentDto) {
    const existingDocument = await this.prisma.campaignDocument.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingDocument) {
      throw new NotFoundException('Documento não encontrado');
    }

    return this.prisma.campaignDocument.update({
      where: { id },
      data: updateDocumentDto,
      include: {
        campaign: {
          select: {
            id: true,
            name: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const existingDocument = await this.prisma.campaignDocument.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!existingDocument) {
      throw new NotFoundException('Documento não encontrado');
    }

    await this.prisma.campaignDocument.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}


