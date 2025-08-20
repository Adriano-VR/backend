// Estrutura de dados das trilhas

interface TrailData {
    slug: string;
    title: string;
    description: string;
}

export const trilhasData: TrailData[] = [
    {
        slug: 'trilha-gestao-empresarial',
        title: 'Trilha de Gestão Empresarial',
        description: 'Trilha completa para desenvolvimento de competências em gestão empresarial, liderança e administração.'
    },
    {
        slug: 'trilha-saude-mental-trabalho',
        title: 'Trilha de Saúde Mental no Trabalho',
        description: 'Trilha focada na promoção da saúde mental, bem-estar e prevenção de problemas psicológicos no ambiente corporativo.'
    },
    {
        slug: 'trilha-desenvolvimento-pessoal',
        title: 'Trilha de Desenvolvimento Pessoal',
        description: 'Trilha para desenvolvimento de competências pessoais, autoconhecimento e crescimento profissional.'
    },
    {
        slug: 'trilha-diversidade-inclusao',
        title: 'Trilha de Diversidade e Inclusão',
        description: 'Trilha para promoção da diversidade, inclusão e equidade no ambiente de trabalho.'
    },
    {
        slug: 'trilha-integracao-colaboradores',
        title: 'Trilha de Integração de Colaboradores',
        description: 'Trilha para onboarding e integração de novos colaboradores na empresa.'
    }
];
