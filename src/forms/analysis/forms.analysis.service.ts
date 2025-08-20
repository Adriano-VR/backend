import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type DomainConfig = Record<string, string[]>;

@Injectable()
export class FormsAnalysisService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Retorna um overview geral (média de todos os scores, taxa de resposta, etc).
   */
  async getOverview(formId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        organization: { include: { activity: true, members: true } },
        questions: { include: { question: true } },
        submittedForms: { include: { answers: true } },
      },
    });

    if (!form || !form.organization) {
      throw new NotFoundException('Formulário ou organização não encontrados');
    }

    const questionMap = new Map<string, any>(
      form.questions.map((fq) => [fq.questionId, fq.question]),
    );

    const completed = form.submittedForms.filter(
      (sf) => sf.status === 'completed',
    );

    const allAnswers = completed.flatMap((sf) =>
      sf.answers
        .filter((a) => a.questionId !== null)
        .map((a) => ({
          answer: a.value,
          question: questionMap.get(a.questionId!),
        })),
    );

    const scores: number[] = [];
    for (const { answer, question } of allAnswers) {
      const score = this.mapAnswerToScore(question, answer);
      if (score !== null) scores.push(score);
    }

    const averageScore =
      scores.length > 0
        ? Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
        : 0;

    return {
      organizationName: form.organization.name,
      activityName: form.organization.activity?.name ?? 'Não definido',
      averageScore,
      marketAverage: 71.2,
      responseRate:
        completed.length > 0
          ? Number(
              (
                (completed.length / (form.organization.members?.length ?? 1)) *
                100
              ).toFixed(1),
            )
          : 0,
      riskLevel:
        averageScore < 60 ? 'high' : averageScore <= 75 ? 'medium' : 'low',
    };
  }

  /**
   * Lógica de conversão de resposta → score (0..100) baseada nas regras do COPSOQ III.
   */
  private mapAnswerToScore(question: any, answer: any): number | null {
    if (answer == null || !question?.options) return null;

    const ansStr = String(answer).trim().toLowerCase();

    const optsRaw: string[] = Array.isArray(question.options.opt)
      ? question.options.opt
      : Array.isArray(question.options)
        ? question.options
        : [];

    if (optsRaw.length < 2) return null;

    const options = optsRaw.map((o) => String(o).trim().toLowerCase());

    // Sinônimos/normalização típicos do COPSOQ III
    const synonyms: Record<string, string> = {
      // escala frequência
      sempre: 'sempre',
      'quase sempre': 'frequentemente',
      frequentemente: 'frequentemente',
      'às vezes': 'às vezes',
      'as vezes': 'às vezes',
      raramente: 'raramente',
      'quase nunca': 'raramente',
      nunca: 'nunca',
      // escala intensidade/extensão
      'muito grande': 'muito grande',
      grande: 'grande',
      média: 'média',
      pequena: 'pequena',
      'muito pequena': 'muito pequena',
      // numéricos
      '1': '1',
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
    };

    const normalized = synonyms[ansStr] ?? ansStr;

    let idx: number;
    if (/^[1-9]\d*$/.test(normalized)) {
      const n = parseInt(normalized, 10);
      if (n < 1 || n > options.length) return null;
      idx = n - 1;
    } else {
      idx = options.indexOf(normalized);
      if (idx === -1) return null;
    }

    // trata escala invertida se houver
    if (question.options.reverse) {
      idx = options.length - 1 - idx;
    }

    const score = (idx / (options.length - 1)) * 100;
    return Number(score.toFixed(1));
  }

  private readonly DOMAIN_DIMENSIONS: DomainConfig = {
    'Demandas no trabalho': ['Demandas no trabalho'],
    'Organização e conteúdo': ['Organização e conteúdo'],
    'Relações sociais e liderança': ['Relações sociais e liderança'],
    'Recompensas e valores': ['Recompensas e valores'],
    'Saúde e bem‑estar': ['Saúde e bem‑estar'],
  };

  /**
   * Calcula a média por domínio (agrupa dimensões relacionadas e retorna só top‑6 de maior risco).
   */

  async getDomainsByForm(formId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        submittedForms: {
          where: { status: 'completed' },
          include: { answers: true },
        },
        questions: { include: { question: true } },
      },
    });
    if (!form) {
      throw new NotFoundException('Formulário não encontrado');
    }

    // Mapeia questionId → dimension & options
    const questionMap = new Map<string, { dimension: string; options: any }>();
    form.questions.forEach((fq) => {
      if (fq.questionId && fq.question?.dimension) {
        questionMap.set(fq.questionId, {
          dimension: fq.question.dimension,
          options: fq.question.options,
        });
      }
    });

    // Acumula scores por dimensão
    const dimensionScores: Record<string, number[]> = {};
    form.submittedForms.forEach((sf) => {
      sf.answers.forEach((a) => {
        if (!a.questionId) return;
        const info = questionMap.get(a.questionId);
        if (!info) return;
        const score = this.mapAnswerToScore(
          { options: info.options },
          a.value,
        );
        if (score === null) return;
        dimensionScores[info.dimension] ??= [];
        dimensionScores[info.dimension].push(score);
      });
    });

    // Calcula média de cada dimensão
    const dimensionAverages = Object.entries(dimensionScores).map(
      ([dimension, scores]) => ({
        dimension,
        avg: scores.reduce((sum, v) => sum + v, 0) / scores.length,
      }),
    );

    // Agrega por domínio
    const domainResults = Object.entries(this.DOMAIN_DIMENSIONS)
      .map(([domain, dims]) => {
        const found = dimensionAverages.filter((d) =>
          dims.includes(d.dimension),
        );
        if (!found.length) return null;
        const domainAvg = found.reduce((s, d) => s + d.avg, 0) / found.length;
        return {
          domain,
          score: Number(domainAvg.toFixed(1)),
          marketAvg: 71.2,
          risk: domainAvg < 60 ? 'high' : domainAvg <= 75 ? 'medium' : 'low',
        };
      })
      .filter(
        (
          x,
        ): x is {
          domain: string;
          score: number;
          marketAvg: number;
          risk: string;
        } => !!x,
      );

    return domainResults.sort((a, b) => a.score - b.score).slice(0, 6);
  }
  async getDimensionsByForm(formId: string) {
    return this.getDomainsByForm(formId);
  }

  async getDepartmentsByForm(formId: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        submittedForms: {
          where: { status: 'completed' },
          include: {
            answers: true,
            profile: {
              include: { department: true },
            },
          },
        },
        questions: { include: { question: true } },
      },
    });

    if (!form) {
      throw new NotFoundException('Formulário não encontrado');
    }

    const questionMap = new Map<string, { dimension: string; options: any }>();
    form.questions.forEach((fq) => {
      if (fq.questionId && fq.question?.dimension) {
        questionMap.set(fq.questionId, {
          dimension: fq.question.dimension,
          options: fq.question.options,
        });
      }
    });

    const scoresByDept: Record<
      string,
      {
        departmentName: string;
        scores: Record<string, number[]>;
        profilesCount: number;
      }
    > = {};

    for (const sf of form.submittedForms) {
      const department = sf.profile?.department;
      if (!department) continue;

      const deptId = department.id;
      const deptName = department.name;

      if (!scoresByDept[deptId]) {
        scoresByDept[deptId] = {
          departmentName: deptName,
          scores: {},
          profilesCount: 0,
        };
      }

      scoresByDept[deptId].profilesCount++;

      for (const answer of sf.answers) {
        if (!answer.questionId) continue;
        const q = questionMap.get(answer.questionId);
        if (!q) continue;

        const score = this.mapAnswerToScore(
          { options: q.options },
          answer.value,
        );
        if (score === null) continue;

        const dim = q.dimension;
        scoresByDept[deptId].scores[dim] ??= [];
        scoresByDept[deptId].scores[dim].push(score);
      }
    }

    const result = Object.entries(scoresByDept).map(([_, data]) => {
      const avg = (arr?: number[]) =>
        arr && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

      const get = (dim: string) => avg(data.scores[dim]);

      const workload = get('Demandas no trabalho');
      const autonomy = get('Organização e conteúdo');
      const support = get('Relações sociais e liderança');
      const recognition = get('Recompensas e valores');
      const balance = get('Saúde e bem‑estar');

      const all = [workload, autonomy, support, recognition, balance];
      const averageScore = avg(all);

      return {
        department: data.departmentName,
        collaborators: data.profilesCount,
        workload: Number(workload.toFixed(1)),
        autonomy: Number(autonomy.toFixed(1)),
        support: Number(support.toFixed(1)),
        recognition: Number(recognition.toFixed(1)),
        balance: Number(balance.toFixed(1)),
        averageScore: Number(averageScore.toFixed(1)),
        risk:
          averageScore < 60 ? 'high' : averageScore <= 75 ? 'medium' : 'low',
      };
    });

    return result.sort((a, b) => a.averageScore - b.averageScore);
  }

  async getResponsesByDepartment(formId: string, department: string) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        submittedForms: {
          where: { status: 'completed' },
          include: {
            answers: true,
            profile: {
              include: { department: true },
            },
          },
        },
        questions: { include: { question: true } },
      },
    });

    if (!form) {
      throw new NotFoundException('Formulário não encontrado');
    }

    const questionMap = new Map<string, { dimension: string; options: any }>();
    form.questions.forEach((fq) => {
      if (fq.questionId && fq.question?.dimension) {
        questionMap.set(fq.questionId, {
          dimension: fq.question.dimension,
          options: fq.question.options,
        });
      }
    });

    const departmentResponses = department
      ? form.submittedForms.filter(
          (sf) => sf.profile?.department?.name === department,
        )
      : form.submittedForms;

    if (departmentResponses.length === 0) {
      throw new NotFoundException(
        `Nenhuma resposta encontrada para o departamento: ${department}`,
      );
    }

    const scoresByDimension: Record<string, number[]> = {};

    for (const sf of departmentResponses) {
      for (const answer of sf.answers) {
        if (!answer.questionId) continue;
        const q = questionMap.get(answer.questionId);
        if (!q) continue;

        const score = this.mapAnswerToScore(
          { options: q.options },
          answer.value,
        );
        if (score === null) continue;

        const dim = q.dimension;
        scoresByDimension[dim] ??= [];
        scoresByDimension[dim].push(score);
      }
    }

    const avg = (arr?: number[]) =>
      arr && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const get = (dim: string) => avg(scoresByDimension[dim]);

    const workload = get('Demandas no trabalho');
    const autonomy = get('Organização e conteúdo');
    const support = get('Relações sociais e liderança');
    const recognition = get('Recompensas e valores');
    const balance = get('Saúde e bem‑estar');

    const all = [workload, autonomy, support, recognition, balance];
    const averageScore = avg(all);

    return {
      department,
      collaborators: departmentResponses.length,
      workload: Number(workload.toFixed(1)),
      autonomy: Number(autonomy.toFixed(1)),
      support: Number(support.toFixed(1)),
      recognition: Number(recognition.toFixed(1)),
      balance: Number(balance.toFixed(1)),
      averageScore: Number(averageScore.toFixed(1)),
      risk: averageScore < 60 ? 'high' : averageScore <= 75 ? 'medium' : 'low',
    };
  }

  async getResponseDetailsByDepartment(
    formId: string,
    departmentName?: string,
  ) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        questions: { include: { question: true } },
        submittedForms: {
          where: {
            status: 'completed',
            profile: {
              department: {
                name: departmentName,
              },
            },
          },
          include: {
            answers: true,
            profile: { include: { department: true } },
          },
        },
      },
    });

    if (!form) throw new NotFoundException('Formulário não encontrado');

    const questionMap = new Map(
      form.questions.map((fq) => [fq.questionId, fq.question]),
    );

    const grouped: Record<string, any[]> = {};

    for (const submission of form.submittedForms) {
      for (const answer of submission.answers) {
        const question = questionMap.get(answer.questionId!);
        if (!question || !question.dimension) continue;

        const dimension = question.dimension;

        if (!grouped[dimension]) grouped[dimension] = [];

        const options: string[] = Array.isArray(question.options)
          ? question.options
          : typeof question.options === 'object' &&
              question.options !== null &&
              'opt' in question.options
            ? (question.options as any).opt
            : [];

        grouped[dimension].push({
          code: question.code,
          question: question.text,
          options,
          answer: answer.value,
        });
      }
    }

    const dimensions = Object.entries(grouped).map(([dimension, questions]) => {
      const groupedQuestions = Object.values(
        questions.reduce((acc: any, q: any) => {
          const key = q.code;
          if (!acc[key]) {
            acc[key] = {
              code: q.code,
              question: q.question,
              options: q.options,
              counts: {} as Record<string, number>,
            };
          }
          acc[key].counts[q.answer] = (acc[key].counts[q.answer] || 0) + 1;
          return acc;
        }, {}),
      );

      const formattedQuestions = groupedQuestions.map((q: any) => {
        const total = Object.values(q.counts as Record<string, number>).reduce(
          (a, b) => a + b,
          0,
        );
        const distribution = q.options.map((opt: string) => ({
          option: opt,
          percentage:
            total > 0
              ? Number((((q.counts[opt] || 0) / total) * 100).toFixed(1))
              : 0,
        }));

        // Cálculo inline do nível de risco
        const average =
          distribution.reduce((sum, d) => sum + d.percentage, 0) /
          (distribution.length || 1);

        const risk = average < 33 ? 'high' : average < 66 ? 'medium' : 'low';

        return {
          code: q.code,
          question: q.question,
          distribution,
          risk,
        };
      });

      return {
        dimension,
        questions: formattedQuestions,
      };
    });

    return dimensions;
  }
  async getRecommendationsByForm(
    formId: string,
    startDate?: Date,
    endDate?: Date,
  ) {
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        submittedForms: {
          where: {
            status: 'completed',
            ...(startDate &&
              endDate && {
                createdAt: {
                  gte: startDate,
                  lte: endDate,
                },
              }),
          },
          include: {
            answers: true,
            profile: {
              include: { department: true },
            },
          },
        },
        questions: { include: { question: true } },
      },
    });

    if (!form) {
      throw new NotFoundException('Formulário não encontrado');
    }

    const questionMap = new Map<string, { dimension: string; options: any }>();
    form.questions.forEach((fq) => {
      if (fq.questionId && fq.question?.dimension) {
        questionMap.set(fq.questionId, {
          dimension: fq.question.dimension,
          options: fq.question.options,
        });
      }
    });

    const departmentScores: Record<
      string,
      Record<string, { total: number; count: number }>
    > = {};

    for (const submission of form.submittedForms) {
      const dept = submission.profile?.department?.name ?? 'Sem Departamento';

      for (const answer of submission.answers) {
        if (!answer.questionId) continue;
        const q = questionMap.get(answer.questionId);
        if (!q) continue;

        const score = this.mapAnswerToScore(
          { options: q.options },
          answer.value,
        );
        if (score === null) continue;

        const dimension = q.dimension;

        if (!departmentScores[dept]) {
          departmentScores[dept] = {};
        }
        if (!departmentScores[dept][dimension]) {
          departmentScores[dept][dimension] = { total: 0, count: 0 };
        }

        departmentScores[dept][dimension].total += score;
        departmentScores[dept][dimension].count += 1;
      }
    }

    const riskyFindings: {
      dimension: string;
      average: number;
      departments: string[];
    }[] = [];

    for (const [dept, dimensions] of Object.entries(departmentScores)) {
      for (const [dimension, data] of Object.entries(dimensions)) {
        const avg = data.total / data.count;
        if (avg < 60) {
          const existing = riskyFindings.find((r) => r.dimension === dimension);
          if (existing) {
            existing.departments.push(dept);
            existing.average = (existing.average + avg) / 2;
          } else {
            riskyFindings.push({
              dimension,
              average: avg,
              departments: [dept],
            });
          }
        }
      }
    }

    const dimensionToSolutionType: Record<
      string,
      'Horas com Profissionais da Saúde' | 'Plano de Ação' | 'Trilha de Cursos'
    > = {
      'Demandas no trabalho': 'Horas com Profissionais da Saúde',
      'Relações sociais e liderança': 'Trilha de Cursos',
      'Recompensas e valores': 'Plano de Ação',
      'Saúde e bem‑estar': 'Plano de Ação',
      'Organização e conteúdo': 'Plano de Ação',
    };

    const recommendations = riskyFindings.map((risk) => {
      const solutionType =
        dimensionToSolutionType[risk.dimension] ?? 'Plano de Ação';

      const baseSolution = {
        title: '',
        type: solutionType,
        description: '',
        departments: risk.departments,
        priority:
          risk.average < 40 ? 'high' : risk.average < 50 ? 'medium' : 'low',
      };

      switch (solutionType) {
        case 'Horas com Profissionais da Saúde':
          baseSolution.title = 'Atendimento Psicológico Especializado';
          baseSolution.description =
            'Sessões individuais ou em grupo com psicólogos especializados para tratar os fatores identificados.';
          break;
        case 'Plano de Ação':
          baseSolution.title = 'Plano de Melhoria Organizacional';
          baseSolution.description =
            'Implementar medidas estruturadas para mitigar os fatores psicossociais críticos detectados.';
          break;
        case 'Trilha de Cursos':
          baseSolution.title = 'Capacitação e Desenvolvimento Humano';
          baseSolution.description =
            'Oferecer cursos e treinamentos voltados ao desenvolvimento de competências relacionais, emocionais e organizacionais.';
          break;
      }

      return {
        category: 'Saúde Mental Organizacional',
        problems: [
          {
            problem: `Risco identificado na dimensão "${risk.dimension}" com média ${Math.round(
              risk.average,
            )}/100`,
            solutions: [baseSolution],
          },
        ],
      };
    });

    return recommendations;
  }
}
