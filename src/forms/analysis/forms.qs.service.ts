import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type FaixaClassificacao = {
  min: number;
  max: number;
  level: 'baixo' | 'médio baixo' | 'médio alto' | 'alto';
  description: string;
};

@Injectable()
export class FormsQsService {
  constructor(private readonly prisma: PrismaService) {}

  async getQsIndividualResults(formId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
          include: {
            question: {
              include: {
                questionGroup: true,
              },
            },
          },
        },
        submittedForms: {
          where: { status: 'completed' },
          include: {
            answers: true,
            profile: {
              select: {
                name: true,
                department: true,
              },
            },
          },
        },
      },
    });

    if (!form) {
      throw new NotFoundException('Formulário não encontrado');
    }

    const qsQuestions = form.questions.filter(
      (fq) => fq.question?.questionGroup?.name === 'QS',
    );

    if (qsQuestions.length === 0) {
      throw new NotFoundException('Perguntas do grupo QS não encontradas');
    }

    const QS_GROUPS = {
      grupo1: { name: 'Autoconhecimento', range: [1, 6] },
      grupo2: { name: 'Propósito', range: [7, 11] },
      grupo3: { name: 'Comprometimento', range: [12, 16] },
      grupo4: { name: 'Influência', range: [17, 25] },
    };

    const individualResults = form.submittedForms.map((submission) => {
      const answerMap = new Map(
        submission.answers.map((a) => [a.questionId, a.value]),
      );

      const groupScores = Object.entries(QS_GROUPS).reduce(
        (acc, [key, { range }]) => {
          const questionsInGroup = qsQuestions.slice(range[0] - 1, range[1]);
          const total = questionsInGroup.reduce((sum, fq) => {
            const ans = answerMap.get(fq.questionId);
            const parsed =
              typeof ans === 'string' ? parseInt(ans) : Number(ans);
            return sum + (isNaN(parsed) ? 0 : parsed);
          }, 0);
          acc[key] = total;
          return acc;
        },
        {} as Record<string, number>,
      );

      const totalScore =
        groupScores.grupo1 +
        groupScores.grupo2 +
        groupScores.grupo3 +
        groupScores.grupo4;

      const classification = this.classifyTotal(totalScore);

      return {
        name: submission.profile?.name ?? 'Sem nome',
        department: submission.profile?.department ?? 'Sem departamento',
        grupo1Score: groupScores.grupo1,
        grupo2Score: groupScores.grupo2,
        grupo3Score: groupScores.grupo3,
        grupo4Score: groupScores.grupo4,
        totalScore,
        classification,
      };
    });

    return {
      formTitle: form.title,
      results: individualResults,
    };
  }

  private classificarPorFaixa(score: number, faixas: FaixaClassificacao[]) {
    const faixa = faixas.find((f) => score >= f.min && score <= f.max);
    return (
      faixa ?? {
        level: 'baixo',
        description: 'Faixa não encontrada.',
      }
    );
  }

  private classifyTotal(score: number) {
    return this.classificarPorFaixa(score, this.FAIXA_TOTAL);
  }

  private readonly FAIXAS_QS: Record<string, FaixaClassificacao[]> = {
    grupo1: [
      {
        min: 0,
        max: 12,
        level: 'baixo',
        description:
          'Precisaremos evoluir consideravelmente no autoconhecimento...',
      },
      {
        min: 13,
        max: 18,
        level: 'médio baixo',
        description:
          'Você já deu bons passos em direção a uma vida espiritual saudável...',
      },
      {
        min: 19,
        max: 24,
        level: 'médio alto',
        description: 'Você possui uma maturidade pessoal considerável...',
      },
      {
        min: 25,
        max: 30,
        level: 'alto',
        description: 'Sua capacidade de domínio próprio está elevada...',
      },
    ],
    grupo2: [
      {
        min: 0,
        max: 10,
        level: 'baixo',
        description: 'Você está sentindo necessidade de encontrar o caminho...',
      },
      {
        min: 11,
        max: 15,
        level: 'médio baixo',
        description:
          'Você está descobrindo a necessidade de se conectar ao propósito...',
      },
      {
        min: 16,
        max: 20,
        level: 'médio alto',
        description:
          'Você está no caminho de se sentir aceito e bem conectado...',
      },
      {
        min: 21,
        max: 25,
        level: 'alto',
        description:
          'Você atingiu uma maturidade essencial ao seu sucesso e felicidade...',
      },
    ],
    grupo3: [
      {
        min: 0,
        max: 10,
        level: 'baixo',
        description:
          'Você está no nível inicial de jornada rumo ao propósito...',
      },
      {
        min: 11,
        max: 15,
        level: 'médio baixo',
        description:
          'Você está descobrindo sua missão e saindo da fase de namoro com ela...',
      },
      {
        min: 16,
        max: 20,
        level: 'médio alto',
        description:
          'Você está bem consciente do que deseja, precisa afinar o foco...',
      },
      {
        min: 21,
        max: 25,
        level: 'alto',
        description:
          'Você está acima da média. Cheio de convicções do que realmente vale a pena...',
      },
    ],
    grupo4: [
      {
        min: 0,
        max: 18,
        level: 'baixo',
        description:
          'Você está no início de uma jornada de inteligência espiritual...',
      },
      {
        min: 19,
        max: 27,
        level: 'médio baixo',
        description:
          'Você está no início de uma herdade de iluminação ao próximo...',
      },
      {
        min: 28,
        max: 36,
        level: 'médio alto',
        description:
          'Você tem caminhado bem na sua jornada em busca ao desenvolvimento...',
      },
      {
        min: 37,
        max: 45,
        level: 'alto',
        description:
          'Você está bem alinhado ao seu propósito e todos ganham com isso...',
      },
    ],
  };

  private readonly FAIXA_TOTAL: FaixaClassificacao[] = [
    {
      min: 0,
      max: 49,
      level: 'baixo',
      description: 'Você está no início da jornada de evolução da sua QS.',
    },
    {
      min: 50,
      max: 74,
      level: 'médio baixo',
      description:
        'Você tem dado passos importantes, mas ainda há muito a desenvolver.',
    },
    {
      min: 75,
      max: 99,
      level: 'médio alto',
      description:
        'Você está com um bom desenvolvimento, quase atingindo a excelência.',
    },
    {
      min: 100,
      max: 125,
      level: 'alto',
      description: 'Parabéns! Sua QS está em um nível elevado e inspirador.',
    },
  ];
}
