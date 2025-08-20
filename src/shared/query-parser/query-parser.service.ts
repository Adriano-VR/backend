import { Injectable } from '@nestjs/common';
import * as qs from 'qs';

@Injectable()
export class QueryParserService {
  /**
   * Processa query string e transforma em objeto válido para Prisma
   * @param query - Query string ou objeto de parâmetros
   * @returns Objeto processado para usar com Prisma
   */
  parseQuery(query: any): any {
    let parsedQuery = query;

    // Se a query veio como string (de URL), fazer parse
    if (typeof query === 'string') {
      parsedQuery = qs.parse(query, {
        depth: 10,
        parseArrays: true,
        allowPrototypes: false,
      });
    }

    // Se a query vem como objeto flat (do NestJS @Query()), converter para aninhado
    if (this.isFlatQuery(query)) {
      // Converter query flat para string e depois para objeto aninhado
      const queryString = this.flatObjectToQueryString(query);
      parsedQuery = qs.parse(queryString, {
        depth: 10,
        parseArrays: true,
        allowPrototypes: false,
      });
    }

    // Processar campos específicos
    const processedQuery: any = {};

    // Processar WHERE
    if (parsedQuery.where) {
      processedQuery.where = this.processWhereClause(parsedQuery.where);
    }

    // Processar INCLUDE
    if (parsedQuery.include) {
      processedQuery.include = this.processIncludeClause(parsedQuery.include);
    }

    // Processar SELECT
    if (parsedQuery.select) {
      processedQuery.select = this.processSelectClause(parsedQuery.select);
    }

    // Processar ORDER BY
    if (parsedQuery.orderBy) {
      processedQuery.orderBy = this.processOrderByClause(parsedQuery.orderBy);
    }

    // Processar TAKE (limit)
    if (parsedQuery.take) {
      processedQuery.take = parseInt(parsedQuery.take as string) || undefined;
    }

    // Processar SKIP (offset)
    if (parsedQuery.skip) {
      processedQuery.skip = parseInt(parsedQuery.skip as string) || undefined;
    }

    return {
      ...processedQuery,
      getCount: parsedQuery.getCount,
    };
  }

  /**
   * Verifica se a query está em formato flat (chaves como 'where[slug][equals]')
   */
  private isFlatQuery(query: any): boolean {
    if (!query || typeof query !== 'object') return false;

    const keys = Object.keys(query);
    return keys.some((key) => key.includes('[') && key.includes(']'));
  }

  /**
   * Converte objeto flat para query string
   */
  private flatObjectToQueryString(flatObj: any): string {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(flatObj)) {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    }

    return params.toString();
  }

  private processWhereClause(where: any): any {
    if (!where) return undefined;

    // Se já é um objeto válido, retornar
    if (typeof where === 'object' && !Array.isArray(where)) {
      return this.convertStringBooleans(where);
    }

    return where;
  }

  private processIncludeClause(include: any): any {
    if (!include) return undefined;

    // Se é um objeto válido, processar e converter strings boolean
    if (typeof include === 'object' && !Array.isArray(include)) {
      return this.convertStringBooleans(include);
    }

    return include;
  }

  private processSelectClause(select: any): any {
    if (!select) return undefined;

    // Se é um objeto válido, processar e converter strings boolean
    if (typeof select === 'object' && !Array.isArray(select)) {
      return this.convertStringBooleans(select);
    }

    return select;
  }

  private processOrderByClause(orderBy: any): any {
    if (!orderBy) return undefined;

    // Se é um objeto válido, processar e converter strings boolean
    if (typeof orderBy === 'object') {
      return this.convertStringBooleans(orderBy);
    }

    return orderBy;
  }

  /**
   * Converte strings 'true'/'false' em booleans reais e 'null' em null real
   */
  private convertStringBooleans(obj: any): any {
    if (obj === null || obj === undefined) return obj;

    if (typeof obj === 'string') {
      if (obj === 'true') return true;
      if (obj === 'false') return false;
      if (obj === 'null') return null;
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.convertStringBooleans(item));
    }

    if (typeof obj === 'object') {
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.convertStringBooleans(value);
      }
      return result;
    }

    return obj;
  }
}
