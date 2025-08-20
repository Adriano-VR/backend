import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { CountDto } from './dto/count.dto';
import { GenericService } from './generic.service';

@Controller('generic')
export class GenericController {
  constructor(private readonly genericService: GenericService) {}

  @Post('count')
  async count(
    @Body() countDto: CountDto,
  ): Promise<{ count: number; entity: string; query?: any }> {
    const { entity, query } = countDto;

    console.log({ entity, query }, 'countDto-to-show');
    try {
      const count = await this.genericService.count(entity, query);

      console.log(count, 'count-to-show');

      return {
        count,
        entity,
        query,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('entities')
  async getAvailableEntities(): Promise<{ entities: string[] }> {
    const entities = this.genericService.getAvailableEntities();
    return { entities };
  }
}
