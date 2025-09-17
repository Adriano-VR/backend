import { Test, TestingModule } from '@nestjs/testing';
import { SubmittedFormsService } from '../src/submitted-forms/submitted-forms.service';
import { SubmittedFormRepository } from '../src/repositories/submitted-form-repositorie';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotificationsService } from '../src/notifications/notifications.service';

describe('SubmittedFormsService', () => {
  let service: SubmittedFormsService;
  let repository: SubmittedFormRepository;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;

  const mockRepository = {
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

  const mockPrismaService = {
    form: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
    },
    campaign: {
      findFirst: jest.fn(),
    },
    profile: {
      findFirst: jest.fn(),
    },
  };

  const mockNotificationsService = {
    createNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubmittedFormsService,
        {
          provide: SubmittedFormRepository,
          useValue: mockRepository,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: NotificationsService,
          useValue: mockNotificationsService,
        },
      ],
    }).compile();

    service = module.get<SubmittedFormsService>(SubmittedFormsService);
    repository = module.get<SubmittedFormRepository>(SubmittedFormRepository);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('deve notificar o admin da organização quando um colaborador submeter formulário', async () => {
      const dto = {
        formId: 'form-1',
        profileId: 'user-1',
        status: 'completed',
      } as any;

      const created = { id: 'sub-1', ...dto, campaignId: 'camp-1' };
      const form = { id: 'form-1', organizationId: 'org-1', title: 'Formulário Teste' };
      const admin = { id: 'admin-1', role: 'admin', name: 'Admin Teste' };

      (mockRepository.create as jest.Mock).mockResolvedValue(created);
      (mockPrismaService.form.findUnique as jest.Mock).mockResolvedValue(form);
      (mockPrismaService.campaign.findFirst as jest.Mock).mockResolvedValue({ id: 'camp-1', name: 'Campanha Ativa' });
      (mockPrismaService.profile.findFirst as jest.Mock).mockResolvedValue(admin);

      const result = await service.create(dto);

      expect(result).toBeDefined();
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith({
        profileId: admin.id,
        title: 'Nova resposta de formulário',
        message: expect.stringContaining('colaborador respondeu'),
      });
    });
  });

  describe('update', () => {
    it('deve notificar o admin quando status mudar para completed', async () => {
      const id = 'sub-1';
      const updateDto = { status: 'completed' };
      const existing = { id, formId: 'form-1', status: 'in_progress' };
      const updated = { ...existing, status: 'completed' };
      const form = { id: 'form-1', organizationId: 'org-1', title: 'Formulário Teste' };
      const admin = { id: 'admin-1', role: 'admin', name: 'Admin Teste' };

      (mockRepository.findById as jest.Mock).mockResolvedValue(existing);
      (mockRepository.update as jest.Mock).mockResolvedValue(updated);
      (mockPrismaService.form.findUnique as jest.Mock).mockResolvedValue(form);
      (mockPrismaService.profile.findFirst as jest.Mock).mockResolvedValue(admin);

      const result = await service.update(id, updateDto);

      expect(result).toBeDefined();
      expect(mockNotificationsService.createNotification).toHaveBeenCalledWith({
        profileId: admin.id,
        title: 'Formulário completado',
        message: expect.stringContaining('colaborador completou'),
      });
    });

    it('não deve notificar quando status não for completed', async () => {
      const id = 'sub-1';
      const updateDto = { status: 'in_progress' };
      const existing = { id, formId: 'form-1', status: 'pending' };
      const updated = { ...existing, status: 'in_progress' };

      (mockRepository.findById as jest.Mock).mockResolvedValue(existing);
      (mockRepository.update as jest.Mock).mockResolvedValue(updated);

      const result = await service.update(id, updateDto);

      expect(result).toBeDefined();
      expect(mockNotificationsService.createNotification).not.toHaveBeenCalled();
    });
  });
});