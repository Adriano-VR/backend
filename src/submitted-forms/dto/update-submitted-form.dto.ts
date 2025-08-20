import { PartialType } from '@nestjs/mapped-types';
import { CreateSubmittedFormDto } from './create-submitted-form.dto';

export class UpdateSubmittedFormDto extends PartialType(
  CreateSubmittedFormDto,
) {}
