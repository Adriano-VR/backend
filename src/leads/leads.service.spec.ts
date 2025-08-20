// src/leads/leads.service.spec.ts

import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLeadDto } from './dto/create-lead.dto';

describe('LeadsService', () => {
  let service: LeadsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeadsService, PrismaService],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('deveria criar um lead com sucesso', async () => {
    // Monta um DTO de teste, omitindo utmSource, utmMedium e utmCampaign porque são opcionais
    const dto: CreateLeadDto = {
      nome: 'Teste de Lead',
      email: 'teste@example.com',
      whatsapp: '+5511999999999',
      pageUrl: 'https://seusite.com/calculator',
      // Usamos string válida para formType (enum local)
      formType: 'RISK_CALCULATOR' as any,
      payload: { score: 90 },
    };

    // Mock do método prisma.lead.create
    jest.spyOn(prisma.lead, 'create').mockResolvedValue({
      id: 'uuid-de-teste',
      nome: dto.nome,
      email: dto.email,
      whatsapp: dto.whatsapp,
      pageUrl: dto.pageUrl,
      formType: dto.formType,
      utmSource: undefined,
      utmMedium: undefined,
      utmCampaign: undefined,
      payload: dto.payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const lead = await service.create(dto);
    expect(lead).toHaveProperty('id', 'uuid-de-teste');
    expect(lead.email).toEqual('teste@example.com');
    expect(lead.formType).toEqual(dto.formType);
  });
});
