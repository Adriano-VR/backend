import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateProfileDto } from './create-profile.dto';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  @ApiPropertyOptional({
    description: 'ID do perfil não pode ser atualizado',
    readOnly: true,
  })
  id?: never;

  @ApiPropertyOptional({
    description: 'Slug não pode ser atualizado diretamente',
    readOnly: true,
  })
  slug?: never;

  @ApiPropertyOptional({
    description: 'Email não pode ser alterado por este endpoint',
    readOnly: true,
  })
  email?: never;
}
