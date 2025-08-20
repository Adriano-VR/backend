import { Role } from "@prisma/client";

export interface UserMock {
    name: string;
    email: string;
    password: string;
    role: Role;
    whatsapp: string;
    jobTitle: string;
    slug: string;
    completed_onboarding: boolean;
    collaborators?: UserMock[];
    personalCorpEmail?: string;
}

export interface DepartmentMock {
    name: string;
    slug: string;
}


export interface GroupMock {
    name: string;
    slug: string;
}

export interface OrganizationMock {
    hasCompletedOnboarding: boolean;
    headOfficeUuid: string;
    isActive: boolean;
    nr1Status: string;
    registrationCode: string;
    inviteCode: string;
    name: string;
    slug: string;
    whatsapp: string;
    logo?: string;
    type: string;
    cnpj?: string;
    departments?: DepartmentMock[];
}