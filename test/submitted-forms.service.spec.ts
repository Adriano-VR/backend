import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SubmittedFormsService } from '../src/submitted-forms/submitted-forms.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { SubmittedFormRepository } from '../src/repositories/submitted-form-repositorie';
import { CreateSubmittedFormDto, FormStatus } from '../src/submitted-forms/dto/create-submitted-form.dto';

describe('SubmittedFormsService', () => {
  let service: SubmittedFormsService;
  let prismaService: PrismaService;
  let submittedFormRepository: SubmittedFormRepository;

  const mockPrismaService = {
    form: {
      findUnique: jest.fn(),
    },
    campaign: {
      findFirst: jest.fn(),
    },
  };

  const mockSubmittedFormRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    findByFormId: jest.fn(),
    findByProfileId: jest.fn(),
    findByStatus: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findOrganizationSubmittedForms: jest.fn(),
    findFormsByOrganization: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmittedFormsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SubmittedFormRepository,
          useValue: mockSubmittedFormRepository,
        },
      ],
    }).compile();

    service = module.get<SubmittedFormsService>(SubmittedFormsService);
    prismaService = module.get<PrismaService>(PrismaService);
    submittedFormRepository = module.get<SubmittedFormRepository>(SubmittedFormRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve criar submitted form sem campanha quando não há campanha ativa', async () => {
      const createSubmittedFormDto: CreateSubmittedFormDto = {
        formId: 'form-123',
        profileId: 'profile-123',
        status: FormStatus.pending,
      };

      const mockForm = {
        id: 'form-123',
        organizationId: 'org-123',
      };

      const mockSubmittedForm = {
        id: 'submitted-form-123',
        ...createSubmittedFormDto,
        campaignId: null,
      };

      mockPrismaService.form.findUnique.mockResolvedValue(mockForm);
      mockPrismaService.campaign.findFirst.mockResolvedValue(null); // Nenhuma campanha ativa
      mockSubmittedFormRepository.create.mockResolvedValue(mockSubmittedForm);

      const result = await service.create(createSubmittedFormDto);

      expect(result).toBeDefined();
      expect(result.campaignId).toBeNull();
      expect(mockSubmittedFormRepository.create).toHaveBeenCalledWith(createSubmittedFormDto);
    });

    it('deve vincular automaticamente à campanha ativa quando não fornecido campaignId', async () => {
      const createSubmittedFormDto: CreateSubmittedFormDto = {
        formId: 'form-123',
        profileId: 'profile-123',
        status: FormStatus.pending,
      };

      const mockForm = {
        id: 'form-123',
        organizationId: 'org-123',
      };

      const mockActiveCampaign = {
        id: 'campaign-123',
        name: 'Campanha Ativa',
      };

      const mockSubmittedForm = {
        id: 'submitted-form-123',
        ...createSubmittedFormDto,
        campaignId: 'campaign-123',
      };

      mockPrismaService.form.findUnique.mockResolvedValue(mockForm);
      mockPrismaService.campaign.findFirst.mockResolvedValue(mockActiveCampaign);
      mockSubmittedFormRepository.create.mockResolvedValue(mockSubmittedForm);

      const result = await service.create(createSubmittedFormDto);

      expect(result).toBeDefined();
      expect(result.campaignId).toBe('campaign-123');
      expect(mockSubmittedFormRepository.create).toHaveBeenCalledWith({
        ...createSubmittedFormDto,
        campaignId: 'campaign-123',
      });
    });

    it('deve usar campaignId fornecido quando fornecido', async () => {
      const createSubmittedFormDto: CreateSubmittedFormDto = {
        formId: 'form-123',
        profileId: 'profile-123',
        status: FormStatus.pending,
        campaignId: 'campaign-fornecida-123',
      };

      const mockSubmittedForm = {
        id: 'submitted-form-123',
        ...createSubmittedFormDto,
      };

      mockSubmittedFormRepository.create.mockResolvedValue(mockSubmittedForm);

      const result = await service.create(createSubmittedFormDto);

      expect(result).toBeDefined();
      expect(result.campaignId).toBe('campaign-fornecida-123');
      expect(mockSubmittedFormRepository.create).toHaveBeenCalledWith(createSubmittedFormDto);
      expect(mockPrismaService.form.findUnique).not.toHaveBeenCalled();
    });

    it('deve lidar com erro quando formulário não é encontrado', async () => {
      const createSubmittedFormDto: CreateSubmittedFormDto = {
        formId: 'form-inexistente',
        profileId: 'profile-123',
        status: FormStatus.pending,
      };

      const mockSubmittedForm = {
        id: 'submitted-form-123',
        ...createSubmittedFormDto,
        campaignId: null,
      };

      mockPrismaService.form.findUnique.mockResolvedValue(null);
      mockSubmittedFormRepository.create.mockResolvedValue(mockSubmittedForm);

      const result = await service.create(createSubmittedFormDto);

      expect(result).toBeDefined();
      expect(result.campaignId).toBeNull();
      expect(mockSubmittedFormRepository.create).toHaveBeenCalledWith(createSubmittedFormDto);
    });

    it('deve lidar com erro quando formulário não tem organização', async () => {
      const createSubmittedFormDto: CreateSubmittedFormDto = {
        formId: 'form-123',
        profileId: 'profile-123',
        status: FormStatus.pending,
      };

      const mockForm = {
        id: 'form-123',
        organizationId: null,
      };

      const mockSubmittedForm = {
        id: 'submitted-form-123',
        ...createSubmittedFormDto,
        campaignId: null,
      };

      mockPrismaService.form.findUnique.mockResolvedValue(mockForm);
      mockSubmittedFormRepository.create.mockResolvedValue(mockSubmittedForm);

      const result = await service.create(createSubmittedFormDto);

      expect(result).toBeDefined();
      expect(result.campaignId).toBeNull();
      expect(mockSubmittedFormRepository.create).toHaveBeenCalledWith(createSubmittedFormDto);
    });
  });

  describe('linkToCampaign', () => {
    it('deve vincular submitted form à campanha', async () => {
      const submittedFormId = 'submitted-form-123';
      const campaignId = 'campaign-123';

      const mockSubmittedForm = {
        id: submittedFormId,
        formId: 'form-123',
        profileId: 'profile-123',
        campaignId: null,
      };

      const mockUpdatedSubmittedForm = {
        ...mockSubmittedForm,
        campaignId: campaignId,
      };

      mockSubmittedFormRepository.findById.mockResolvedValue(mockSubmittedForm);
      mockSubmittedFormRepository.update.mockResolvedValue(mockUpdatedSubmittedForm);

      const result = await service.linkToCampaign(submittedFormId, campaignId);

      expect(result).toBeDefined();
      expect(result.campaignId).toBe(campaignId);
      expect(mockSubmittedFormRepository.update).toHaveBeenCalledWith(submittedFormId, {
        campaign: { connect: { id: campaignId } }
      });
    });

    it('deve lançar NotFoundException quando submitted form não existe', async () => {
      const submittedFormId = 'submitted-form-inexistente';
      const campaignId = 'campaign-123';

      mockSubmittedFormRepository.findById.mockResolvedValue(null);

      await expect(service.linkToCampaign(submittedFormId, campaignId)).rejects.toThrow(
        NotFoundException
      );

      await expect(service.linkToCampaign(submittedFormId, campaignId)).rejects.toThrow(
        'SubmittedForm com ID submitted-form-inexistente não encontrado'
      );
    });
  });
});
