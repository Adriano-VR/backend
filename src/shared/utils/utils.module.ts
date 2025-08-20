import { Global, Module } from '@nestjs/common';
import { UtilsService } from './utils.service';

@Global() // Torna o módulo global, disponível em toda a aplicação
@Module({
  providers: [UtilsService],
  exports: [UtilsService], // Exporta o serviço para ser usado em outros módulos
})
export class UtilsModule {}
