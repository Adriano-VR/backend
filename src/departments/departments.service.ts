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
      return this.departmentRepository.reactivate(existingDeletedDepartment.id);
    }

    // Verifica se o slug já existe e gera um novo se necessário
    let slug = createDepartmentDto.slug;
    const existingBySlug = await this.departmentRepository.findBySlug(slug);
    if (existingBySlug) {
      // Se o slug já existe, gera um novo usando a mesma lógica determinística
      slug = this.generateDeterministicSlug(createDepartmentDto.name);
    }

    // Cria um novo departamento se não existe nenhum com o mesmo nome
    return this.departmentRepository.create({
      ...createDepartmentDto,
      slug: slug,
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
