import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsService } from '../src/campaigns/campaigns.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { CreateCampaignDto, CampaignFrequency, CampaignStatus } from '../src/campaigns/dto/create-campaign.dto';

describe('CampaignsService', () => {
  let service: CampaignsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    campaign: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a campaign successfully', async () => {
      const createCampaignDto: CreateCampaignDto = {
        name: 'Campanha Teste',
        description: 'Descrição da campanha',
        frequency: CampaignFrequency.SEMESTRAL,
        startDate: '2024-01-01',
        status: CampaignStatus.ACTIVE,
      };

      const mockCampaign = {
        id: 'campaign-id',
        ...createCampaignDto,
        startDate: new Date(createCampaignDto.startDate),
        endDate: null,
        createdById: 'user-id',
        organizationId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        organization: null,
        createdBy: {
          id: 'user-id',
          name: 'User Name',
          email: 'user@example.com',
        },
        _count: {
          submittedForms: 0,
          projects: 0,
          documents: 0,
        },
      };

      mockPrismaService.campaign.create.mockResolvedValue(mockCampaign);

      const result = await service.create(createCampaignDto, 'user-id');

      expect(prismaService.campaign.create).toHaveBeenCalledWith({
        data: {
          ...createCampaignDto,
          startDate: new Date(createCampaignDto.startDate),
          endDate: null,
          createdById: 'user-id',
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              submittedForms: true,
              projects: true,
              documents: true,
            },
          },
        },
      });

      expect(result).toEqual({
        id: 'campaign-id',
        name: 'Campanha Teste',
        description: 'Descrição da campanha',
        frequency: CampaignFrequency.SEMESTRAL,
        startDate: new Date('2024-01-01'),
        endDate: null,
        status: CampaignStatus.ACTIVE,
        organizationId: null,
        createdById: 'user-id',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
        deletedAt: null,
        organization: null,
        createdBy: {
          id: 'user-id',
          name: 'User Name',
          email: 'user@example.com',
        },
        submittedFormsCount: 0,
        projectsCount: 0,
        documentsCount: 0,
      });
    });
  });

  describe('findAll', () => {
    it('should return all campaigns for an organization', async () => {
      const mockCampaigns = [
        {
          id: 'campaign-1',
          name: 'Campanha 1',
          description: 'Descrição 1',
          frequency: CampaignFrequency.SEMESTRAL,
          startDate: new Date('2024-01-01'),
          endDate: null,
          status: CampaignStatus.ACTIVE,
          organizationId: 'org-1',
          createdById: 'user-1',
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
          organization: {
            id: 'org-1',
            name: 'Organização 1',
            slug: 'org-1',
          },
          createdBy: {
            id: 'user-1',
            name: 'User 1',
            email: 'user1@example.com',
          },
          _count: {
            submittedForms: 5,
            projects: 2,
            documents: 3,
          },
        },
      ];

      mockPrismaService.campaign.findMany.mockResolvedValue(mockCampaigns);

      const result = await service.findAll('org-1');

      expect(prismaService.campaign.findMany).toHaveBeenCalledWith({
        where: {
          organizationId: 'org-1',
          deletedAt: null,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              submittedForms: true,
              projects: true,
              documents: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('campaign-1');
      expect(result[0].submittedFormsCount).toBe(5);
    });
  });

  describe('findOne', () => {
    it('should return a campaign by id', async () => {
      const mockCampaign = {
        id: 'campaign-id',
        name: 'Campanha Teste',
        description: 'Descrição da campanha',
        frequency: CampaignFrequency.SEMESTRAL,
        startDate: new Date('2024-01-01'),
        endDate: null,
        status: CampaignStatus.ACTIVE,
        organizationId: 'org-1',
        createdById: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        organization: {
          id: 'org-1',
          name: 'Organização 1',
          slug: 'org-1',
        },
        createdBy: {
          id: 'user-1',
          name: 'User 1',
          email: 'user1@example.com',
        },
        _count: {
          submittedForms: 5,
          projects: 2,
          documents: 3,
        },
      };

      mockPrismaService.campaign.findFirst.mockResolvedValue(mockCampaign);

      const result = await service.findOne('campaign-id');

      expect(prismaService.campaign.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'campaign-id',
          deletedAt: null,
        },
        include: {
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              submittedForms: true,
              projects: true,
              documents: true,
            },
          },
        },
      });

      expect(result.id).toBe('campaign-id');
    });

    it('should throw NotFoundException when campaign not found', async () => {
      mockPrismaService.campaign.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent-id')).rejects.toThrow('Campanha não encontrada');
    });
  });
});


