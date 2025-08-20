import { Injectable } from '@nestjs/common';

@Injectable()
export class UtilsService {
  /**
   * Cria um slug a partir de um nome, removendo acentos e caracteres especiais
   * @param name Nome para converter em slug
   * @returns String formatada como slug com um número aleatório no final
   */
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

  /**
   * Capitaliza a primeira letra de cada palavra
   * @param text Texto para capitalizar
   * @returns Texto com primeira letra de cada palavra maiúscula
   */
  capitalizeWords(text: string): string {
    return text.replace(/\b\w/g, (l) => l.toUpperCase());
  }

  /**
   * Remove acentos de uma string
   * @param text Texto para remover acentos
   * @returns Texto sem acentos
   */
  removeAccents(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Gera um ID único baseado em timestamp e número aleatório
   * @returns String única
   */
  generateUniqueId(): string {
    const timestamp = Date.now().toString(36);
    const randomNum = Math.random().toString(36).substr(2, 5);
    return `${timestamp}-${randomNum}`;
  }

  /**
   * Formata um CPF/CNPJ removendo caracteres especiais
   * @param document CPF ou CNPJ
   * @returns Documento apenas com números
   */
  cleanDocument(document: string): string {
    return document.replace(/\D/g, '');
  }

  /**
   * Valida se uma string é um email válido
   * @param email Email para validar
   * @returns Boolean indicando se é válido
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Trunca um texto para um determinado tamanho
   * @param text Texto para truncar
   * @param maxLength Tamanho máximo
   * @param suffix Sufixo a adicionar (padrão: '...')
   * @returns Texto truncado
   */
  truncateText(
    text: string,
    maxLength: number,
    suffix: string = '...',
  ): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Converte um objeto em query string
   * @param obj Objeto para converter
   * @returns Query string
   */
  objectToQueryString(obj: Record<string, any>): string {
    const params = new URLSearchParams();
    Object.entries(obj).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.append(key, value.toString());
      }
    });
    return params.toString();
  }

  /**
   * Formata um número para moeda brasileira
   * @param value Valor numérico
   * @returns String formatada como moeda
   */
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }

  /**
   * Gera uma senha aleatória
   * @param length Tamanho da senha (padrão: 12)
   * @param includeSpecialChars Se deve incluir caracteres especiais
   * @returns Senha gerada
   */
  generateRandomPassword(
    length: number = 12,
    includeSpecialChars: boolean = true,
  ): string {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    let chars = lowercase + uppercase + numbers;
    if (includeSpecialChars) {
      chars += specialChars;
    }

    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return password;
  }

  /**
   * Converte uma data para o formato brasileiro
   * @param date Data para formatar
   * @returns String no formato dd/mm/aaaa
   */
  formatDateToBR(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('pt-BR');
  }

  /**
   * Converte uma data para o formato brasileiro com hora
   * @param date Data para formatar
   * @returns String no formato dd/mm/aaaa hh:mm:ss
   */
  formatDateTimeToBR(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString('pt-BR');
  }
}
