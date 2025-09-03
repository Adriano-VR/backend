import { Module } from '@nestjs/common'
import { TarefaService } from './tarefa.service'
import { TarefaController } from './tarefa.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [TarefaController],
  providers: [TarefaService],
  exports: [TarefaService]
})
export class TarefaModule {}

