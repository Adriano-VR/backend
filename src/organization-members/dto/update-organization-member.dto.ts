import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateOrganizationMemberDto } from './create-organization-member.dto';

// Remove profileId e organizationId do update pois são chaves que não devem ser alteradas
export class UpdateOrganizationMemberDto extends PartialType(
  OmitType(CreateOrganizationMemberDto, [
    'profileId',
    'organizationId',
  ] as const),
) {}
