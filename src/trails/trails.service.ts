import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FindWithQueryResult } from 'src/repositories/generic-repository-method';
import { QueryParserService } from 'src/shared/query-parser/query-parser.service';
import { Trail } from '../../prisma/types';
import { TrailRepository } from '../repositories/trail-repositorie';
import { CreateTrailDto, UpdateTrailDto } from './dto';

@Injectable()
export class TrailsService {
  constructor(
    private readonly trailRepository: TrailRepository,
    private readonly queryParserService: QueryParserService,
  ) {}

  async create(createTrailDto: CreateTrailDto): Promise<Trail> {
    // Verifica se existe uma trilha com o mesmo slug
    const existingTrail = await this.trailRepository.findBySlug(
      createTrailDto.slug,
    );
    if (existingTrail) {
      throw new ConflictException('Já existe uma trilha com este slug');
    }

    return this.trailRepository.create(createTrailDto);
  }

  async findAll(): Promise<Trail[]> {
    return this.trailRepository.findAll();
  }

  async findById(id: string): Promise<Trail> {
    const trail = await this.trailRepository.findById(id);
    if (!trail) {
      throw new NotFoundException('Trilha não encontrada');
    }
    return trail;
  }

  async findBySlug(slug: string): Promise<Trail> {
    const trail = await this.trailRepository.findBySlug(slug);
    if (!trail) {
      throw new NotFoundException('Trilha não encontrada');
    }
    return trail;
  }

  async update(id: string, updateTrailDto: UpdateTrailDto): Promise<Trail> {
    const trail = await this.trailRepository.findById(id);
    if (!trail) {
      throw new NotFoundException('Trilha não encontrada');
    }

    // Se está atualizando o slug, verifica se não existe conflito
    if (updateTrailDto.slug && updateTrailDto.slug !== trail.slug) {
      const existingTrail = await this.trailRepository.findBySlug(
        updateTrailDto.slug,
      );
      if (existingTrail) {
        throw new ConflictException('Já existe uma trilha com este slug');
      }
    }

    return this.trailRepository.update(id, updateTrailDto);
  }

  async remove(id: string): Promise<Trail> {
    const trail = await this.trailRepository.findById(id);
    if (!trail) {
      throw new NotFoundException('Trilha não encontrada');
    }

    return this.trailRepository.delete(id);
  }

  async findWithQuery(query: any): Promise<FindWithQueryResult<Trail>> {
    const parsedQuery = this.queryParserService.parseQuery(query);

    console.log('Query trails original:', query);
    console.log('Query trails parsed:', parsedQuery);

    return this.trailRepository.findWithQuery(parsedQuery);
  }
}
