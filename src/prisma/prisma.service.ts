// src/prisma/prisma.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private readonly maxRetries = 10;
  private readonly retryDelayMs = 5000; // 5 segundos

  constructor() {
    super({
      log: ['error', 'warn'],
    });
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  private async connectWithRetry(attempt = 1): Promise<void> {
    try {
      this.logger.log(
        `🔗 Tentativa ${attempt}/${this.maxRetries} - Conectando ao banco de dados...`,
      );
      await this.$connect();
      this.logger.log('✅ Conectado ao banco de dados com sucesso!');
    } catch (error) {
      this.logger.error(
        `❌ Erro na tentativa ${attempt}/${this.maxRetries}:`,
        error.message,
      );

      if (attempt >= this.maxRetries) {
        this.logger.error(
          '🚨 Máximo de tentativas de conexão atingido. Falha ao conectar ao banco de dados.',
        );
        throw error;
      }

      this.logger.log(
        `⏳ Aguardando ${this.retryDelayMs}ms antes da próxima tentativa...`,
      );
      await this.sleep(this.retryDelayMs);

      return this.connectWithRetry(attempt + 1);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
