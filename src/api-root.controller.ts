import { Controller, Get } from '@nestjs/common';

@Controller()
export class ApiRootController {
  @Get()
  getApiRoot(): string {
    return 'Hello World específico para /api!';
  }
}
