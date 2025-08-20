export type FindWithQueryResult<T> = T[] | { data: T[]; count: number };

export abstract class GenericRepositoryMethod<T> {
  abstract findWithQuery(query: any): Promise<FindWithQueryResult<T>>;
  abstract update(id: string, data: any): Promise<T>;
  abstract delete(id: string): Promise<T>;
  abstract findAll(): Promise<T[]>;
  abstract findById(id: string): Promise<T | null>;
  abstract count(query?: any): Promise<number>;
}

// Classe base para implementações Prisma genéricas
export abstract class PrismaGenericRepository<
  T,
> extends GenericRepositoryMethod<T> {
  protected abstract entityName: string;
  protected abstract defaultInclude?: any;
  protected abstract prisma: any;

  protected buildFindWithQuery(query: any): any {
    const prismaQuery: any = {};

    // Se existe where na query, adicionar
    if (query.where) {
      prismaQuery.where = query.where;
    }

    // Garantir que sempre filtre por entidades não deletadas por padrão
    // A menos que deletedAt seja explicitamente especificado na query
    if (!prismaQuery.where) {
      prismaQuery.where = {};
    }

    // Se deletedAt não foi especificado na query, filtrar por não deletados
    if (!prismaQuery.where.hasOwnProperty('deletedAt')) {
      prismaQuery.where.deletedAt = null;
    }

    // Se existe include na query, adicionar
    if (query.include) {
      prismaQuery.include = query.include;
    } else if (this.defaultInclude) {
      // Include padrão caso não seja especificado
      prismaQuery.include = this.defaultInclude;
    }

    // Se existe orderBy na query, adicionar
    if (query.orderBy) {
      prismaQuery.orderBy = query.orderBy;
    }

    // Se existe take (limit) na query, adicionar
    if (query.take) {
      prismaQuery.take = parseInt(query.take);
    }

    // Se existe skip na query, adicionar
    if (query.skip) {
      prismaQuery.skip = parseInt(query.skip);
    }

    // Se existe select na query, adicionar (substitui include)
    if (query.select) {
      delete prismaQuery.include;
      prismaQuery.select = query.select;
    }

    return prismaQuery;
  }

  protected buildCountQuery(query: any): any {
    const prismaQuery: any = {};

    // Se existe where na query, adicionar
    if (query?.where) {
      prismaQuery.where = query.where;
    }

    // Garantir que sempre filtre por entidades não deletadas por padrão
    // A menos que deletedAt seja explicitamente especificado na query
    if (!prismaQuery.where) {
      prismaQuery.where = {};
    }

    // Se deletedAt não foi especificado na query, filtrar por não deletados
    if (!prismaQuery.where.hasOwnProperty('deletedAt')) {
      prismaQuery.where.deletedAt = null;
    }

    return prismaQuery;
  }

  async findWithQuery(query: any): Promise<FindWithQueryResult<T>> {
    const prismaQuery = this.buildFindWithQuery(query);

    const entities = await this.prisma[this.entityName].findMany(prismaQuery);

    if (query.getCount) {
      console.log(prismaQuery.where, 'prismaQuery.where in count');
      const count = await this.prisma[this.entityName].count({
        where: prismaQuery.where,
      });
      return { data: entities as T[], count };
    }

    return entities as T[];
  }

  async count(query?: any): Promise<number> {
    const prismaQuery = this.buildCountQuery(query);

    console.log(
      {
        entity: this.entityName,
        originalQuery: query,
        prismaQuery,
      },
      `count - ${this.entityName}`,
    );

    const count = await this.prisma[this.entityName].count(prismaQuery);
    return count;
  }

  makeSlug(name: string): string {
    const number = Math.floor(100000 + Math.random() * 900000);

    return (
      name
        .toLowerCase()
        // Substituir acentos e caracteres especiais
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos (acentos)
        // Substituir caracteres especiais por hífens
        .replace(/[^a-z0-9\s-]/g, '')
        // Substituir espaços por hífens
        .replace(/\s+/g, '-')
        // Remover hífens consecutivos
        .replace(/-+/g, '-')
        // Remover hífens no início e fim
        .replace(/^-+|-+$/g, '') +
      '-' +
      number
    );
  }

  findBySlug(slug: string): Promise<T | null> {
    return this.prisma[this.entityName].findUnique({
      where: { slug },
    });
  }
}
