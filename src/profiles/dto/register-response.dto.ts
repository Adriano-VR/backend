export class RegisterResponseDto {
  user!: {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: Date;
    cpf: string | null;
  };

  organization!: {
    id: string;
    name: string;
    whatsapp: string;
    nr1_status: string | null;
    is_active: boolean;
    has_completed_onboarding: boolean;
    head_office_uuid: string;
    created_at: Date;
  };
}
