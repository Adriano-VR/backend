import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { DepartmentsService } from '../src/departments/departments.service';
import { DepartmentRepository } from '../src/repositories/department-repositorie';
import { QueryParserService } from '../src/shared/query-parser/query-parser.service';
import { CreateDepartmentDto } from '../src/departments/dto';

describe('DepartmentsService', () => {
  let service: DepartmentsService;
  let mockDepartmentRepository: jest.Mocked<DepartmentRepository>;
  let mockQueryParserService: jest.Mocked<QueryParserService>;

  beforeEach(async () => {
    const mockRepo = {
      findByName: jest.fn(),
      findDeletedByName: jest.fn(),
      findBySlug: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      reactivate: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByOrganizationId: jest.fn(),
      associateProfileToDepartment: jest.fn(),
      findWithQuery: jest.fn(),
    };

    const mockQueryParser = {
      parseQuery: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DepartmentsService,
        {
          provide: DepartmentRepository,
          useValue: mockRepo,
        },
        {
          provide: QueryParserService,
          useValue: mockQueryParser,
        },
      ],
    }).compile();

    service = module.get<DepartmentsService>(DepartmentsService);
    mockDepartmentRepository = module.get(DepartmentRepository);
    mockQueryParserService = module.get(QueryParserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateDepartmentDto = {
      name: 'Financeiro',
      organizationId: 'org-123',
    };

    it('should create department with unique slug when no conflicts exist', async () => {
      // Mock: não existe departamento com mesmo nome
      mockDepartmentRepository.findByName.mockResolvedValue(null);
      mockDepartmentRepository.findDeletedByName.mockResolvedValue(null);
      mockDepartmentRepository.findBySlug.mockResolvedValue(null);
      mockDepartmentRepository.create.mockResolvedValue({
        id: 'dept-123',
        name: 'Financeiro',
        slug: 'financeiro-org12345',
        organizationId: 'org-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any);

      const result = await service.create(createDto);

      expect(result.slug).toBe('financeiro-org12345');
      expect(mockDepartmentRepository.create).toHaveBeenCalledWith({
        ...createDto,
        slug: 'financeiro-org12345',
      });
    });

    it('should generate unique slug when base slug already exists', async () => {
      // Mock: não existe departamento com mesmo nome
      mockDepartmentRepository.findByName.mockResolvedValue(null);
      mockDepartmentRepository.findDeletedByName.mockResolvedValue(null);
      
      // Mock: slug base já existe
      mockDepartmentRepository.findBySlug
        .mockResolvedValueOnce({ id: 'existing-dept' } as any) // primeira chamada retorna existente
        .mockResolvedValueOnce(null); // segunda chamada retorna null (slug único)
      
      mockDepartmentRepository.create.mockResolvedValue({
        id: 'dept-123',
        name: 'Financeiro',
        slug: 'financeiro-org12345-1',
        organizationId: 'org-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as any);

      const result = await service.create(createDto);

      expect(result.slug).toBe('financeiro-org12345-1');
      expect(mockDepartmentRepository.findBySlug).toHaveBeenCalledTimes(2);
      expect(mockDepartmentRepository.create).toHaveBeenCalledWith({
        ...createDto,
        slug: 'financeiro-org12345-1',
      });
    });

    it('should throw ConflictException when department with same name exists', async () => {
      mockDepartmentRepository.findByName.mockResolvedValue({
        id: 'existing-dept',
        name: 'Financeiro',
        slug: 'financeiro',
        organizationId: 'org-123',
      } as any);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      expect(mockDepartmentRepository.create).not.toHaveBeenCalled();
    });

    it('should reactivate soft-deleted department when exists', async () => {
      const softDeletedDept = {
        id: 'deleted-dept',
        name: 'Financeiro',
        slug: 'financeiro',
        organizationId: 'org-123',
        deletedAt: new Date(),
      };

      mockDepartmentRepository.findByName.mockResolvedValue(null);
      mockDepartmentRepository.findDeletedByName.mockResolvedValue(softDeletedDept);
      mockDepartmentRepository.reactivate.mockResolvedValue({
        ...softDeletedDept,
        deletedAt: null,
      } as any);

      const result = await service.create(createDto);

      expect(mockDepartmentRepository.reactivate).toHaveBeenCalledWith('deleted-dept');
      expect(mockDepartmentRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('generateUniqueSlug', () => {
    it('should generate unique slug with organization suffix when base slug exists', async () => {
      // Mock: slug base já existe, mas slug com sufixo da org não
      mockDepartmentRepository.findBySlug
        .mockResolvedValueOnce({ id: 'existing-dept' } as any) // 'financeiro-org12345' existe
        .mockResolvedValueOnce(null); // 'financeiro-org12345-1' não existe

      const result = await (service as any).generateUniqueSlug('Financeiro', 'org-123');

      expect(result).toBe('financeiro-org12345-1');
      expect(mockDepartmentRepository.findBySlug).toHaveBeenCalledTimes(2);
    });

    it('should use timestamp when counter limit is reached', async () => {
      // Mock: todos os slugs com contador existem
      mockDepartmentRepository.findBySlug.mockResolvedValue({ id: 'existing-dept' } as any);

      const result = await (service as any).generateUniqueSlug('Financeiro', 'org-123');

      expect(result).toMatch(/^financeiro-org12345-\d+$/);
      expect(mockDepartmentRepository.findBySlug).toHaveBeenCalled();
    });
  });

  describe('generateOrganizationSuffix', () => {
    it('should generate suffix from organization ID', () => {
      const result = (service as any).generateOrganizationSuffix('org-12345-abcdef');
      expect(result).toBe('org-1234');
    });

    it('should handle short organization IDs', () => {
      const result = (service as any).generateOrganizationSuffix('org123');
      expect(result).toBe('org123');
    });
  });

  describe('generateBaseSlug', () => {
    it('should generate clean slug from name', () => {
      const result = (service as any).generateBaseSlug('Financeiro & Contábil');
      expect(result).toBe('financeiro-contabil');
    });

    it('should handle accented characters', () => {
      const result = (service as any).generateBaseSlug('Administração');
      expect(result).toBe('administracao');
    });

    it('should handle special characters', () => {
      const result = (service as any).generateBaseSlug('R&D (Research & Development)');
      expect(result).toBe('rd-research-development');
    });
  });
});
