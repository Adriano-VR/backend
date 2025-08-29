export interface ProjectResponseDto {
  id: string;
  title: string;
  slug: string;
  isTemplate: boolean;
  type: string;
  description?: string;
  problem?: string;
  solution?: string;
  impact?: string;
  metrics?: string;
  timeline?: string;
  resources?: string;
  risks?: string;
  status: string;
  createdAt: Date;
  createdById?: string;
  organizationId?: string;
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
  
  actions?: Array<{
    id: string;
    title: string;
    description?: string;
    status: string;
    startDate?: Date;
    endDate?: Date;
    responsible?: string;
    resources?: string;
  }>;
  
  campaigns?: Array<{
    id: string;
    name: string;
    description?: string;
    status: string;
  }>;
  
  // Contadores
  actionsCount: number;
  campaignsCount: number;
}
