import { PartialType } from '@nestjs/swagger';
import { CreateTrailDto } from './create-trail.dto';

export class UpdateTrailDto extends PartialType(CreateTrailDto) {}
