import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CampaignsService } from '../src/campaigns/campaigns.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { ChecklistProjectService } from '../src/services/checklist-project.service';
import { CreateCampaignDto, CampaignStatus } from '../src/campaigns/dto/create-campaign.dto';
import { UpdateCampaignDto } from '../src/campaigns/dto/update-campaign.dto';

describe('CampaignsService', () => {
  let service: CampaignsService;
  let prismaService: PrismaService;
  let checklistProjectService: ChecklistProjectService;

  const mockPrismaService = {
    campaign: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockChecklistProjectService = {
    createChecklistProject: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ChecklistProjectService,
          useValue: mockChecklistProjectService,
        },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
    prismaService = module.get<PrismaService>(PrismaService);
    checklistProjectService = module.get<ChecklistProjectService>(ChecklistProjectService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar uma campanha inativa sem problemas', async () => {
      const createCampaignDto: CreateCampaignDto = {
        name: 'Campanha Teste',
        description: 'Descrição da campanha',
        frequency: 'semestral',
        startDate: '2024-01-01',
        status: CampaignStatus.INACTIVE,
        organizationId: 'org-123',
      };

      const mockCampaign = {
        id: 'campaign-123',
        ...createCampaignDto,
        startDate: new Date(createCampaignDto.startDate),
        endDate: null,
        createdById: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        organization: { id: 'org-123', name: 'Org Teste', slug: 'org-teste' },
        createdBy: { id: 'user-123', name: 'User Teste', email: 'user@teste.com' },
        _count: { submittedForms: 0, projects: 0, documents: 0 },
      };

      mockPrismaService.campaign.findFirst.mockResolvedValue(null);
      mockPrismaService.campaign.create.mockResolvedValue(mockCampaign);

      const result = await service.create(createCampaignDto, 'user-123');

      expect(result).toBeDefined();
      expect(result.name).toBe('Campanha Teste');
      expect(mockPrismaService.campaign.create).toHaveBeenCalledTimes(1);
    });

    it('deve criar uma campanha ativa quando não há campanha ativa na organização', async () => {
      const createCampaignDto: CreateCampaignDto = {
        name: 'Campanha Ativa',
        description: 'Descrição da campanha ativa',
        frequency: 'semestral',
        startDate: '2024-01-01',
        status: CampaignStatus.ACTIVE,
        organizationId: 'org-123',
      };

      const mockCampaign = {
        id: 'campaign-123',
        ...createCampaignDto,
        startDate: new Date(createCampaignDto.startDate),
        endDate: null,
        createdById: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        organization: { id: 'org-123', name: 'Org Teste', slug: 'org-teste' },
        createdBy: { id: 'user-123', name: 'User Teste', email: 'user@teste.com' },
        _count: { submittedForms: 0, projects: 0, documents: 0 },
      };

      // Não há campanha ativa na organização
      mockPrismaService.campaign.findFirst.mockResolvedValue(null);
      mockPrismaService.campaign.create.mockResolvedValue(mockCampaign);

      const result = await service.create(createCampaignDto, 'user-123');

      expect(result).toBeDefined();
      expect(result.name).toBe('Campanha Ativa');
      expect(mockPrismaService.campaign.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar BadRequestException ao tentar criar campanha ativa quando já existe uma ativa na organização', async () => {
      const createCampaignDto: CreateCampaignDto = {
        name: 'Nova Campanha Ativa',
        description: 'Descrição da nova campanha ativa',
        frequency: 'semestral',
        startDate: '2024-01-01',
        status: CampaignStatus.ACTIVE,
        organizationId: 'org-123',
      };

      const existingActiveCampaign = {
        id: 'existing-campaign-123',
        name: 'Campanha Ativa Existente',
        organizationId: 'org-123',
        status: CampaignStatus.ACTIVE,
        deletedAt: null,
      };

      mockPrismaService.campaign.findFirst.mockResolvedValue(existingActiveCampaign);

      await expect(service.create(createCampaignDto, 'user-123')).rejects.toThrow(
        BadRequestException
      );

      await expect(service.create(createCampaignDto, 'user-123')).rejects.toThrow(
        'Não é possível criar uma campanha ativa. A organização já possui uma campanha ativa: "Campanha Ativa Existente". Finalize ou pause a campanha ativa antes de criar uma nova.'
      );

      expect(mockPrismaService.campaign.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('deve ativar uma campanha quando não há campanha ativa na organização', async () => {
      const campaignId = 'campaign-123';
      const updateCampaignDto: UpdateCampaignDto = {
        status: CampaignStatus.ACTIVE,
      };

      const existingCampaign = {
        id: campaignId,
        name: 'Campanha Teste',
        status: CampaignStatus.INACTIVE,
        organizationId: 'org-123',
        deletedAt: null,
      };

      const updatedCampaign = {
        ...existingCampaign,
        status: CampaignStatus.ACTIVE,
        organization: { id: 'org-123', name: 'Org Teste', slug: 'org-teste' },
        createdBy: { id: 'user-123', name: 'User Teste', email: 'user@teste.com' },
        _count: { submittedForms: 0, projects: 0, documents: 0 },
      };

      mockPrismaService.campaign.findFirst
        .mockResolvedValueOnce(existingCampaign) // Primeira chamada para verificar campanha existente
        .mockResolvedValueOnce(null); // Segunda chamada para verificar campanha ativa na organização
      mockPrismaService.campaign.update.mockResolvedValue(updatedCampaign);

      const result = await service.update(campaignId, updateCampaignDto);

      expect(result).toBeDefined();
      expect(result.status).toBe(CampaignStatus.ACTIVE);
      expect(mockPrismaService.campaign.update).toHaveBeenCalledTimes(1);
    });

    it('deve lançar BadRequestException ao tentar ativar campanha quando já existe uma ativa na organização', async () => {
      const campaignId = 'campaign-123';
      const updateCampaignDto: UpdateCampaignDto = {
        status: CampaignStatus.ACTIVE,
      };

      const existingCampaign = {
        id: campaignId,
        name: 'Campanha Teste',
        status: CampaignStatus.INACTIVE,
        organizationId: 'org-123',
        deletedAt: null,
      };

      const activeCampaign = {
        id: 'active-campaign-123',
        name: 'Campanha Ativa Existente',
        organizationId: 'org-123',
        status: CampaignStatus.ACTIVE,
        deletedAt: null,
      };

      mockPrismaService.campaign.findFirst
        .mockResolvedValueOnce(existingCampaign) // Primeira chamada para verificar campanha existente
        .mockResolvedValueOnce(activeCampaign); // Segunda chamada para verificar campanha ativa na organização

      await expect(service.update(campaignId, updateCampaignDto)).rejects.toThrow(
        BadRequestException
      );

      await expect(service.update(campaignId, updateCampaignDto)).rejects.toThrow(
        'Não é possível ativar esta campanha. A organização já possui uma campanha ativa: "Campanha Ativa Existente". Finalize ou pause a campanha ativa antes de iniciar uma nova.'
      );

      expect(mockPrismaService.campaign.update).not.toHaveBeenCalled();
    });

    it('deve permitir atualizar campanha sem mudança de status', async () => {
      const campaignId = 'campaign-123';
      const updateCampaignDto: UpdateCampaignDto = {
        name: 'Campanha Atualizada',
      };

      const existingCampaign = {
        id: campaignId,
        name: 'Campanha Teste',
        status: CampaignStatus.INACTIVE,
        organizationId: 'org-123',
        deletedAt: null,
      };

      const updatedCampaign = {
        ...existingCampaign,
        name: 'Campanha Atualizada',
        organization: { id: 'org-123', name: 'Org Teste', slug: 'org-teste' },
        createdBy: { id: 'user-123', name: 'User Teste', email: 'user@teste.com' },
        _count: { submittedForms: 0, projects: 0, documents: 0 },
      };

      mockPrismaService.campaign.findFirst.mockResolvedValue(existingCampaign);
      mockPrismaService.campaign.update.mockResolvedValue(updatedCampaign);

      const result = await service.update(campaignId, updateCampaignDto);

      expect(result).toBeDefined();
      expect(result.name).toBe('Campanha Atualizada');
      expect(mockPrismaService.campaign.update).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException quando campanha não existe', async () => {
      const campaignId = 'campaign-inexistente';
      const updateCampaignDto: UpdateCampaignDto = {
        name: 'Campanha Atualizada',
      };

      mockPrismaService.campaign.findFirst.mockResolvedValue(null);

      await expect(service.update(campaignId, updateCampaignDto)).rejects.toThrow(
        NotFoundException
      );

      await expect(service.update(campaignId, updateCampaignDto)).rejects.toThrow(
        'Campanha não encontrada'
      );

      expect(mockPrismaService.campaign.update).not.toHaveBeenCalled();
    });
  });
});