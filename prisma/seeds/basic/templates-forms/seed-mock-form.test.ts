import { PrismaClient } from '@prisma/client';

// Mock do PrismaClient
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    form: {
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    formQuestion: {
      count: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    question: {
      create: jest.fn(),
    },
    questionGroup: {
      create: jest.fn(),
    },
    $disconnect: jest.fn(),
  })),
}));

// Mock do fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

// Mock do path
jest.mock('path', () => ({
  join: jest.fn(),
}));

describe('Seed Mock Form', () => {
  let mockPrisma: any;
  let mockFs: any;
  let mockPath: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockPrisma = new PrismaClient();
    mockFs = require('fs');
    mockPath = require('path');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('seedMockForm', () => {
    it('deve criar formulário mock com sucesso', async () => {
      // Arrange
      const mockFormData = {
        slug: 'form_mock_001',
        id: 'form_mock_001',
        title: 'Formulário de Teste - 5 Perguntas',
        instructions: 'Instruções de teste',
        questions: [
          {
            id: 'q_001',
            code: 'MOCK1',
            dimension: 'Satisfação Geral',
            level: 'MOCK',
            text: 'Pergunta de teste',
            type: 'scale_intensity',
            options: ['1', '2', '3', '4', '5']
          }
        ]
      };

      mockPath.join.mockReturnValue('/mock/path/form-mock.json');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockFormData));
      
      mockPrisma.form.findFirst.mockResolvedValue(null);
      mockPrisma.form.create.mockResolvedValue({ id: 'form-123', title: mockFormData.title });
      mockPrisma.questionGroup.create.mockResolvedValue({ id: 'group-123', name: 'Questões de Teste' });
      mockPrisma.question.create.mockResolvedValue({ id: 'question-123', code: 'MOCK1' });
      mockPrisma.formQuestion.create.mockResolvedValue({ id: 'form-question-123' });

      // Act
      const { seedMockForm } = require('./seed-mock-form');
      await seedMockForm();

      // Assert
      expect(mockPrisma.form.create).toHaveBeenCalledWith({
        data: {
          slug: mockFormData.slug,
          title: mockFormData.title,
          description: expect.stringContaining('5 perguntas'),
          instructions: mockFormData.instructions,
          isTemplate: true,
          qualityDiagnosis: 'mock',
        },
      });

      expect(mockPrisma.questionGroup.create).toHaveBeenCalledWith({
        data: {
          name: 'Questões de Teste',
          label: 'Questões de Teste',
          slug: 'form_mock_001-questoes-teste',
          order: 1,
          meta: {
            description: 'Grupo para questões do formulário de teste mock',
            color: '#6C7B7F',
            icon: 'test',
            type: 'mock',
          },
        },
      });

      expect(mockPrisma.question.create).toHaveBeenCalledWith({
        data: {
          code: 'MOCK1',
          level: 'MOCK',
          dimension: 'Satisfação Geral',
          text: 'Pergunta de teste',
          type: 'scale_intensity',
          options: expect.any(Array),
          questionGroupId: 'group-123',
        },
      });
    });

    it('deve lidar com formulário existente', async () => {
      // Arrange
      const existingForm = { id: 'existing-123', title: 'Formulário Existente' };
      const mockFormData = {
        slug: 'form_mock_001',
        title: 'Formulário de Teste',
        questions: []
      };

      mockPath.join.mockReturnValue('/mock/path/form-mock.json');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockFormData));
      
      mockPrisma.form.findFirst.mockResolvedValue(existingForm);
      mockPrisma.formQuestion.count.mockResolvedValue(3);
      mockPrisma.form.delete.mockResolvedValue({});
      mockPrisma.form.create.mockResolvedValue({ id: 'new-123', title: mockFormData.title });

      // Act
      const { seedMockForm } = require('./seed-mock-form');
      await seedMockForm();

      // Assert
      expect(mockPrisma.formQuestion.deleteMany).toHaveBeenCalledWith({
        where: { formId: 'existing-123' }
      });
      expect(mockPrisma.form.delete).toHaveBeenCalledWith({
        where: { id: 'existing-123' }
      });
    });

    it('deve lidar com arquivo não encontrado', async () => {
      // Arrange
      mockPath.join.mockReturnValue('/mock/path/form-mock.json');
      mockFs.existsSync.mockReturnValue(false);

      // Act & Assert
      const { seedMockForm } = require('./seed-mock-form');
      await expect(seedMockForm()).rejects.toThrow('Arquivo não encontrado');
    });

    it('deve desconectar do Prisma ao finalizar', async () => {
      // Arrange
      const mockFormData = {
        slug: 'form_mock_001',
        title: 'Formulário de Teste',
        questions: []
      };

      mockPath.join.mockReturnValue('/mock/path/form-mock.json');
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockReturnValue(JSON.stringify(mockFormData));
      
      mockPrisma.form.findFirst.mockResolvedValue(null);
      mockPrisma.form.create.mockResolvedValue({ id: 'form-123', title: mockFormData.title });
      mockPrisma.questionGroup.create.mockResolvedValue({ id: 'group-123', name: 'Questões de Teste' });

      // Act
      const { seedMockForm } = require('./seed-mock-form');
      await seedMockForm();

      // Assert
      expect(mockPrisma.$disconnect).toHaveBeenCalled();
    });
  });
});
