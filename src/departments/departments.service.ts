import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindWithQueryResult } from 'src/repositories/generic-repository-method';
import { QueryParserService } from 'src/shared/query-parser/query-parser.service';
import { Department } from '../../prisma/types';
import { DepartmentRepository } from '../repositories/department-repositorie';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto';
import { AssociateProfileToDepartmentDto } from './dto/associate-profile-to-department';

@Injectable()
export class DepartmentsService {
  constructor(
    private readonly departmentRepository: DepartmentRepository,
    private readonly queryParserService: QueryParserService,
  ) {}

  async create(createDepartmentDto: CreateDepartmentDto): Promise<Department> {
    console.log('🔧 [DepartmentsService] Criando departamento:', createDepartmentDto);
    
    // Primeiro verifica se existe um departamento ativo com o mesmo nome
    const existingActiveDepartment = await this.departmentRepository.findByName(
      createDepartmentDto.name,
      createDepartmentDto.organizationId,
    );
    if (existingActiveDepartment) {
      throw new ConflictException(
        'Já existe um departamento ativo com este nome na organização',
      );
    }

    // Verifica se existe um departamento soft-deleted com o mesmo nome
    const existingDeletedDepartment =
      await this.departmentRepository.findDeletedByName(
        createDepartmentDto.name,
        createDepartmentDto.organizationId,
      );
    if (existingDeletedDepartment) {
      // Reativa o departamento existente
      console.log('🔄 [DepartmentsService] Reativando departamento existente:', existingDeletedDepartment.name);
      return this.departmentRepository.reactivate(existingDeletedDepartment.id);
    }

    // Se o frontend enviou um slug, verificar se é único
    let finalSlug = createDepartmentDto.slug;
    
    if (finalSlug) {
      console.log('🔧 [DepartmentsService] Usando slug fornecido pelo frontend:', finalSlug);
      
      // Verificar se o slug já existe
      const existingBySlug = await this.departmentRepository.findBySlug(finalSlug);
      if (existingBySlug) {
        console.log('⚠️ [DepartmentsService] Slug já existe, gerando novo slug único');
        // Se o slug já existe, gerar um novo
        finalSlug = await this.generateUniqueSlug(
          createDepartmentDto.name, 
          createDepartmentDto.organizationId
        );
      }
    } else {
      console.log('🔧 [DepartmentsService] Nenhum slug fornecido, gerando novo');
      // Se não foi fornecido slug, gerar um novo
      finalSlug = await this.generateUniqueSlug(
        createDepartmentDto.name, 
        createDepartmentDto.organizationId
      );
    }

    console.log('✅ [DepartmentsService] Slug final:', finalSlug);

    // Cria um novo departamento com slug único
    return this.departmentRepository.create({
      ...createDepartmentDto,
      slug: finalSlug,
    });
  }

  async findAll(): Promise<Department[]> {
    return this.departmentRepository.findAll();
  }

  async findById(id: string): Promise<Department> {
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new NotFoundException('Departamento não encontrado');
    }
    return department;
  }

  async findBySlug(slug: string): Promise<Department> {
    const department = await this.departmentRepository.findBySlug(slug);
    if (!department) {
      throw new NotFoundException('Departamento não encontrado');
    }
    return department;
  }

  async findByOrganizationId(organizationId: string): Promise<Department[]> {
    return this.departmentRepository.findByOrganizationId(organizationId);
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<Department> {
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new NotFoundException('Departamento não encontrado');
    }

    // Se está atualizando o slug, verifica se não existe conflito
    if (
      updateDepartmentDto.slug &&
      updateDepartmentDto.slug !== department.slug
    ) {
      const existingDepartment = await this.departmentRepository.findBySlug(
        updateDepartmentDto.slug,
      );
      if (existingDepartment) {
        throw new ConflictException('Já existe um departamento com este slug');
      }
    }

    return this.departmentRepository.update(id, updateDepartmentDto);
  }

  async remove(id: string): Promise<Department> {
    const department = await this.departmentRepository.findById(id);
    if (!department) {
      throw new NotFoundException('Departamento não encontrado');
    }

    return this.departmentRepository.delete(id);
  }

  async removeByName(
    name: string,
    organizationId: string,
  ): Promise<Department> {
    const department = await this.departmentRepository.findByName(
      name,
      organizationId,
    );
    if (!department) {
      throw new NotFoundException('Departamento não encontrado');
    }

    return this.departmentRepository.delete(department.id);
  }

  /**
   * Gera um slug único baseado no nome e organização, verificando se já existe no banco
   * @param name Nome do departamento
   * @param organizationId ID da organização
   * @returns Slug único
   */
  private async generateUniqueSlug(name: string, organizationId: string): Promise<string> {
    // Gerar slug base incluindo parte do ID da organização para garantir unicidade
    const baseSlug = this.generateBaseSlug(name);
    const orgSuffix = this.generateOrganizationSuffix(organizationId);
    let finalSlug = `${baseSlug}-${orgSuffix}`;
    let counter = 1;

    // Verificar se o slug já existe e gerar um novo se necessário
    while (await this.departmentRepository.findBySlug(finalSlug)) {
      finalSlug = `${baseSlug}-${orgSuffix}-${counter}`;
      counter++;
      
      // Limite de segurança para evitar loop infinito
      if (counter > 100) {
        // Se chegou ao limite, adiciona timestamp para garantir unicidade
        const timestamp = Date.now();
        finalSlug = `${baseSlug}-${orgSuffix}-${timestamp}`;
        break;
      }
    }

    return finalSlug;
  }

  /**
   * Gera um sufixo baseado no ID da organização para garantir unicidade
   * @param organizationId ID da organização
   * @returns Sufixo único para a organização
   */
  private generateOrganizationSuffix(organizationId: string): string {
    // Usar os primeiros 8 caracteres do ID da organização
    // Isso garante que departamentos de organizações diferentes tenham slugs diferentes
    return organizationId.substring(0, 8);
  }

  /**
   * Gera um slug base baseado no nome
   * @param name Nome do departamento
   * @returns Slug base
   */
  private generateBaseSlug(name: string): string {
    // Remover caracteres especiais e espaços, converter para minúsculas
    const cleanText = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim();
    
    return cleanText;
  }

  /**
   * Gera um slug determinístico baseado no nome, replicando a lógica do frontend
   * @param name Nome do departamento
   * @returns Slug determinístico
   */
  private generateDeterministicSlug(name: string): string {
    // Remover caracteres especiais e espaços, converter para minúsculas
    const cleanText = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
      .trim()
    
    // Gerar um número baseado no hash do texto para ser determinístico
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      const char = name.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Converte para 32-bit integer
    }
    
    // Usar o valor absoluto do hash para gerar um número de 6 dígitos
    const number = Math.abs(hash) % 1000000
    
    return cleanText + '-' + number.toString().padStart(6, '0')
  }

  async associateProfileToDepartment(
    associateProfileToDepartmentDto: AssociateProfileToDepartmentDto,
  ): Promise<Department> {
    return this.departmentRepository.associateProfileToDepartment(
      associateProfileToDepartmentDto,
    );
  }

  async findWithQuery(query: any): Promise<FindWithQueryResult<Department>> {
    const parsedQuery = this.queryParserService.parseQuery(query);

    console.log('Query departments original:', query);
    console.log(
      'Query departments processada:',
      JSON.stringify(parsedQuery, null, 2),
    );

    return this.departmentRepository.findWithQuery(parsedQuery);
  }
}
