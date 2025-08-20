import { Role } from "@prisma/client";
import { randomUUID } from "crypto";
import { GroupMock, OrganizationMock, UserMock } from "prisma/seeds/types-mock";

export const demoDefaultUsers: UserMock[] = [
    {
        name: 'Gestor Demo',
        email: 'gestor@demo.com',
        password: '123456',
        role: Role.manager,
        whatsapp: '11999999999',
        jobTitle: 'Gestor',
        slug: 'gestor-demo',
        completed_onboarding: true
    },
    {
        name: 'Colaborador Demo',
        email: 'colaborador@demo.com',
        password: '123456',
        role: Role.collaborator,
        whatsapp: '11999999999',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo',
        completed_onboarding: true
    },
    {
        name: 'Profissional Demo',
        email: 'profissional@demo.com',
        password: '123456',
        role: Role.professional,
        whatsapp: '11999999999',
        jobTitle: 'Profissional',
        slug: 'profissional-demo',
        completed_onboarding: true
    }
];

export const demoDefaultGroup: GroupMock = {
    name: 'Grupo Exemplo',
    slug: 'grupo-exemplo'
}

export const demoDefaultOrganizations: OrganizationMock[] = [

    {
        inviteCode: '5A5A5A',
        name: 'Organização Exemplo',
        whatsapp: '+5511999999999',
        type: 'empresa',
        hasCompletedOnboarding: true,
        headOfficeUuid: randomUUID(),
        isActive: true,
        nr1Status: 'meeting_requirements',
        registrationCode: randomUUID(),
        slug: 'organizacao-exemplo',
        departments: [
            {
                name: 'Departamento RH',
                slug: 'departamento-rh'
            }
        ]
    }
]