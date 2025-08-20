import { Controller, Get } from '@nestjs/common';

@Controller('/')
export class RootController {
  @Get()
  getRoot(): string {
    return 'Olá, mundo! Bem-vindo à raiz da aplicação 🚀';
  }
}
