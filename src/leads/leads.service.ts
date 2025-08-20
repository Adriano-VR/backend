import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLeadDto: CreateLeadDto) {
    const {
      nome,
      email,
      whatsapp,
      pageUrl,
      formType,
      utmSource,
      utmMedium,
      utmCampaign,
      payload,
    } = createLeadDto;

    const lead = await this.prisma.lead.create({
      data: {
        nome,
        email,
        whatsapp,
        pageUrl,
        formType: formType as any,
        utmSource,
        utmMedium,
        utmCampaign,
        payload,
      },
    });

    return lead;
  }
}
