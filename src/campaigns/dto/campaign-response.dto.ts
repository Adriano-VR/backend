import { CampaignFrequency, CampaignStatus } from './create-campaign.dto';

export class CampaignResponseDto {
  id: string;
  name: string;
  description?: string;
  frequency: CampaignFrequency;
  startDate: Date;
  endDate?: Date;
  status: CampaignStatus;
  organizationId?: string;
  createdById?: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Relacionamentos
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  
  submittedFormsCount?: number;
  projectsCount?: number;
  documentsCount?: number;

  // Dados detalhados
  projects?: Array<{
    id: string;
    title: string;
    slug: string;
    type: string;
    status: string;
    description?: string;
    actionsCount: number;
  }>;

  submittedForms?: Array<{
    id: string;
    status: string;
    startedAt: Date;
    completedAt?: Date;
    answersCount: number;
  }>;

  documents?: Array<{
    id: string;
    name: string;
    description?: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    createdAt: Date;
  }>;
}


