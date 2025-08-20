import { Role } from '@prisma/client';
import { randomUUID } from 'crypto';
import { GroupMock, OrganizationMock, UserMock } from '../../types-mock';



export const detranUsers: UserMock[] = [
    {
        name: 'Gestor Demo',
        email: 'gestor_detran@demo.com',
        password: '123456',
        role: Role.manager,

        whatsapp: '11999999999',
        jobTitle: 'Gestor',
        slug: 'gestor-demo-detran',
        completed_onboarding: true,
    },
    {
        name: 'Colaborador Demo 1',
        email: 'colaborador1_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999999',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-1-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador1_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 2',
        email: 'colaborador2_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999999',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-2-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador2_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 3',
        email: 'colaborador3_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999998',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-3-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador3_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 4',
        email: 'colaborador4_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999997',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-4-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador4_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 5',
        email: 'colaborador5_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999996',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-5-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador5_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 6',
        email: 'colaborador6_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999995',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-6-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador6_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 7',
        email: 'colaborador7_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999994',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-7-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador7_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 8',
        email: 'colaborador8_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999993',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-8-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador8_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 9',
        email: 'colaborador9_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999992',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-9-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador9_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 10',
        email: 'colaborador10_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999991',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-10-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador10_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 11',
        email: 'colaborador11_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999990',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-11-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador11_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 12',
        email: 'colaborador12_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999989',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-12-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador12_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 13',
        email: 'colaborador13_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999988',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-13-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador13_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 14',
        email: 'colaborador14_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999987',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-14-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador14_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 15',
        email: 'colaborador15_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999986',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-15-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador15_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 16',
        email: 'colaborador16_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999985',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-16-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador16_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 17',
        email: 'colaborador17_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999984',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-17-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador17_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 18',
        email: 'colaborador18_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999983',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-18-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador18_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 19',
        email: 'colaborador19_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999982',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-19-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador19_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 20',
        email: 'colaborador20_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999981',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-20-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador20_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 21',
        email: 'colaborador21_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999980',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-21-detran',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador21_detran@demo_corp.com',
    },
    {
        name: 'Colaborador Demo 22',
        email: 'colaborador22_detran@demo.com',
        password: '123456',
        role: Role.collaborator,

        whatsapp: '11999999979',
        jobTitle: 'Colaborador',
        slug: 'colaborador-demo-22',
        completed_onboarding: true,
        personalCorpEmail: 'colaborador22_detran@demo_corp.com',
    },
];

export const detranGroup: GroupMock = {
    name: 'Grupo Detran',
    slug: 'grupo-detran'
}

export const detranOrganizations: OrganizationMock[] = [
    {
        inviteCode: 'D3TR4N',
        name: 'Detran',
        whatsapp: '+5511999999999',
        logo: 'https://xbase.sfo3.digitaloceanspaces.com/2025/f99419e2027e004d5d60af0ff6370d35.png',
        type: 'empresa',

        hasCompletedOnboarding: true,
        headOfficeUuid: randomUUID(),
        isActive: true,
        nr1Status: 'meeting_requirements',
        registrationCode: randomUUID(),
        slug: 'detran',
        departments: [
            {
                name: 'Departamento de Trânsito',
                slug: 'departamento-de-transito',
            },
            {
                name: 'Departamento de Recursos Humanos',
                slug: 'departamento-de-recursos-humanos',
            },
            {
                name: 'Departamento de Operações',
                slug: 'departamento-de-operacoes',
            },
            {
                name: 'Departamento de Tecnologia da Informação',
                slug: 'departamento-de-ti',
            },
            {
                name: 'Departamento de Segurança',
                slug: 'departamento-de-seguranca',
            },
            {
                name: 'Departamento de Administração',
                slug: 'departamento-de-administracao',
            },
            {
                name: 'Departamento de Atendimento ao Cidadão',
                slug: 'departamento-de-atendimento',
            },
            {
                name: 'Departamento de Fiscalização',
                slug: 'departamento-de-fiscalizacao',
            },
            {
                name: 'Departamento de Licenciamento',
                slug: 'departamento-de-licenciamento',
            },
            {
                name: 'Departamento de Educação para o Trânsito',
                slug: 'departamento-de-educacao',
            },
        ],
    },
];
