import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordConfirmDto {
  @ApiProperty({
    description: 'Access token do Supabase',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: 'Access token é obrigatório' })
  @IsString({ message: 'Access token deve ser uma string' })
  accessToken: string;

  @ApiProperty({
    description: 'Refresh token do Supabase',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: 'Refresh token é obrigatório' })
  @IsString({ message: 'Refresh token deve ser uma string' })
  refreshToken: string;

  @ApiProperty({
    description: 'Nova senha do usuário',
    example: 'NovaSenha',
  })
  @IsNotEmpty({ message: 'Nova senha é obrigatória' })
  @IsString({ message: 'Senha deve ser uma string' })
  @MinLength(6, { message: 'Senha deve ter pelo menos 6 caracteres' })
  password: string;
}
