import { IsNotEmpty, IsString } from 'class-validator';

export class AssociateProfileToOrgDto {
  @IsNotEmpty()
  @IsString()
  profileId: string;

  @IsNotEmpty()
  @IsString()
  inviteCode: string;
}
