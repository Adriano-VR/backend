import { IsObject, IsOptional, IsString } from 'class-validator';

export class CountDto {
  @IsString()
  entity: string;

  @IsOptional()
  @IsObject()
  query?: any;
}
