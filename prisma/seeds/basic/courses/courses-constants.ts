// Estrutura de dados dos cursos

interface LessonData {
    slug: string;
    title: string;
    content: string; // Agora será usado para URL do vídeo
}

interface ModuleData {
    slug: string;
    title: string;
    description: string;
    lessons: LessonData[];
}

interface CourseData {
    slug: string;
    title: string;
    description: string;
    trailSlug?: string; // Slug da trilha ao qual o curso pertence
    modules: ModuleData[];
}

export const cursosData: CourseData[] = [
    {
        slug: 'curso-de-integracao-001',
        title: 'Curso de Integração',
        description: 'Curso completo para integração de novos colaboradores na empresa, abordando cultura organizacional, políticas internas e procedimentos.',
        trailSlug: 'trilha-integracao-colaboradores',
        modules: [
            {
                slug: 'modulo-1-curso-de-integracao',
                title: 'Introdução à Empresa',
                description: 'Apresentação da empresa, missão, visão, valores e história.',
                lessons: [
                    {
                        slug: 'aula-1-modulo-1-curso-de-integracao',
                        title: 'História da Empresa',
                        content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' // Rick Roll como exemplo
                    },
                    {
                        slug: 'aula-2-modulo-1-curso-de-integracao',
                        title: 'Missão, Visão e Valores',
                        content: 'https://www.youtube.com/watch?v=9bZkp7q19f0' // PSY - GANGNAM STYLE
                    },
                    {
                        slug: 'aula-3-modulo-1-curso-de-integracao',
                        title: 'Estrutura Organizacional',
                        content: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk' // Luis Fonsi - Despacito
                    }
                ]
            },
            {
                slug: 'modulo-2-curso-de-integracao',
                title: 'Políticas e Procedimentos',
                description: 'Conhecimento das principais políticas internas e procedimentos operacionais.',
                lessons: [
                    {
                        slug: 'aula-1-modulo-2-curso-de-integracao',
                        title: 'Código de Conduta',
                        content: 'https://www.youtube.com/watch?v=ZZ5LpwO-An4' // Ylvis - The Fox
                    },
                    {
                        slug: 'aula-2-modulo-2-curso-de-integracao',
                        title: 'Política de Recursos Humanos',
                        content: 'https://www.youtube.com/watch?v=OPf0YbXwDMI' // Mark Ronson - Uptown Funk
                    },
                    {
                        slug: 'aula-3-modulo-2-curso-de-integracao',
                        title: 'Processos Operacionais',
                        content: 'https://www.youtube.com/watch?v=YykjpeuMNEk' // Hozier - Take Me To Church
                    }
                ]
            },
            {
                slug: 'modulo-3-curso-de-integracao',
                title: 'Segurança e Saúde no Trabalho',
                description: 'Normas de segurança, prevenção de acidentes e promoção da saúde no ambiente de trabalho.',
                lessons: [
                    {
                        slug: 'aula-1-modulo-3-curso-de-integracao',
                        title: 'Normas de Segurança',
                        content: 'https://www.youtube.com/watch?v=YQHsXMglC9A' // Adele - Hello
                    },
                    {
                        slug: 'aula-2-modulo-3-curso-de-integracao',
                        title: 'Primeiros Socorros',
                        content: 'https://www.youtube.com/watch?v=09R8_2nJtjg' // Maroon 5 - Sugar
                    },
                    {
                        slug: 'aula-3-modulo-3-curso-de-integracao',
                        title: 'Ergonomia e Bem-estar',
                        content: 'https://www.youtube.com/watch?v=JGwWNGJdvx8' // Ed Sheeran - Shape of You
                    }
                ]
            }
        ]
    },
    {
        slug: 'curso-de-saude-mental-001',
        title: 'Curso de Saúde Mental no Trabalho',
        description: 'Curso focado na promoção da saúde mental, prevenção de estresse e burnout, e criação de ambientes de trabalho saudáveis.',
        trailSlug: 'trilha-saude-mental-trabalho',
        modules: [
            {
                slug: 'modulo-1-curso-de-saude-mental',
                title: 'Fundamentos da Saúde Mental',
                description: 'Conceitos básicos sobre saúde mental, estresse e bem-estar psicológico.',
                lessons: [
                    {
                        slug: 'aula-1-modulo-1-curso-de-saude-mental',
                        title: 'O que é Saúde Mental',
                        content: 'https://www.youtube.com/watch?v=8UVNT4wvIGY' // Gotye - Somebody That I Used To Know
                    },
                    {
                        slug: 'aula-2-modulo-1-curso-de-saude-mental',
                        title: 'Estresse e suas Causas',
                        content: 'https://www.youtube.com/watch?v=YVkUvmDQGHY' // Eminem - Not Afraid
                    },
                    {
                        slug: 'aula-3-modulo-1-curso-de-saude-mental',
                        title: 'Impactos no Trabalho',
                        content: 'https://www.youtube.com/watch?v=lp-EO5I60KA' // Ed Sheeran - Thinking Out Loud
                    }
                ]
            },
            {
                slug: 'modulo-2-curso-de-saude-mental',
                title: 'Prevenção e Intervenção',
                description: 'Estratégias para prevenir problemas de saúde mental e intervir quando necessário.',
                lessons: [
                    {
                        slug: 'aula-1-modulo-2-curso-de-saude-mental',
                        title: 'Técnicas de Relaxamento',
                        content: 'https://www.youtube.com/watch?v=09R8_2nJtjg' // Maroon 5 - Sugar
                    },
                    {
                        slug: 'aula-2-modulo-2-curso-de-saude-mental',
                        title: 'Mindfulness no Trabalho',
                        content: 'https://www.youtube.com/watch?v=YQHsXMglC9A' // Adele - Hello
                    },
                    {
                        slug: 'aula-3-modulo-2-curso-de-saude-mental',
                        title: 'Busca de Ajuda Profissional',
                        content: 'https://www.youtube.com/watch?v=lp-EO5I60KA' // Ed Sheeran - Thinking Out Loud
                    }
                ]
            }
        ]
    },
    {
        slug: 'curso-de-lideranca-001',
        title: 'Curso de Liderança',
        description: 'Desenvolvimento de competências de liderança, gestão de equipes e comunicação eficaz.',
        trailSlug: 'trilha-gestao-empresarial',
        modules: [
            {
                slug: 'modulo-1-curso-de-lideranca',
                title: 'Fundamentos da Liderança',
                description: 'Conceitos básicos sobre liderança e diferentes estilos de gestão.',
                lessons: [
                    {
                        slug: 'aula-1-modulo-1-curso-de-lideranca',
                        title: 'O que é Liderança',
                        content: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' // Rick Roll
                    },
                    {
                        slug: 'aula-2-modulo-1-curso-de-lideranca',
                        title: 'Estilos de Liderança',
                        content: 'https://www.youtube.com/watch?v=9bZkp7q19f0' // PSY - GANGNAM STYLE
                    },
                    {
                        slug: 'aula-3-modulo-1-curso-de-lideranca',
                        title: 'Desenvolvendo Líderes',
                        content: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk' // Luis Fonsi - Despacito
                    }
                ]
            },
            {
                slug: 'modulo-2-curso-de-lideranca',
                title: 'Gestão de Equipes',
                description: 'Técnicas para formar, motivar e gerenciar equipes de alta performance.',
                lessons: [
                    {
                        slug: 'aula-1-modulo-2-curso-de-lideranca',
                        title: 'Formação de Equipes',
                        content: 'https://www.youtube.com/watch?v=ZZ5LpwO-An4' // Ylvis - The Fox
                    },
                    {
                        slug: 'aula-2-modulo-2-curso-de-lideranca',
                        title: 'Motivação e Engajamento',
                        content: 'https://www.youtube.com/watch?v=OPf0YbXwDMI' // Mark Ronson - Uptown Funk
                    },
                    {
                        slug: 'aula-3-modulo-2-curso-de-lideranca',
                        title: 'Resolução de Conflitos',
                        content: 'https://www.youtube.com/watch?v=YykjpeuMNEk' // Hozier - Take Me To Church
                    }
                ]
            }
        ]
    }
];