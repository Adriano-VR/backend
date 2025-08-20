import { IsString, IsNotEmpty, IsObject, IsEnum } from 'class-validator';

export enum HistoryType {
  feeling = 'feeling',
  form = 'form',
}

export class CreateHistoryDto {
  @IsString()
  @IsNotEmpty()
  profileId: string;

  @IsEnum(HistoryType)
  type: HistoryType = HistoryType.feeling;

  @IsObject()
  @IsNotEmpty()
  data:
    | {
        frequency: number;
        label: string;
        emotion: string;
        lifeView: string;
        godView: string;
        process: string;
      }
    | {
        formId: string;
        submittedFormId: string;
        // outros campos relevantes
      };
}
