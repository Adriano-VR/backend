import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CopsoqAnalyticsDriver } from './drivers/copsoq-analytics-driver';
import { FormAnalyticsResult } from './dto/form-analytics-result.dto';
import { FormAnalyticsDriver } from './interfaces/form-analytics-driver.interface';
import { question, answer } from '@prisma/client';
import { FormsAnalysisService } from '../forms/analysis/forms.analysis.service';

@Injectable()
export class AnalyticsService {
  private drivers: Record<string, FormAnalyticsDriver> = {
    COPSOQ: new CopsoqAnalyticsDriver(),
    // 'DASS21': new Dass21AnalyticsDriver(), // Exemplo para futuro
  };

  constructor(
    private readonly prisma: PrismaService,
    private readonly formsAnalysisService: FormsAnalysisService,
  ) {}

  async analyzeForm(formId: string): Promise<FormAnalyticsResult> {
    // Buscar o formulário e tipo
    const form: any = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        questions: { include: { question: true } },
        submittedForms: {
          include: { answers: true },
        },
      },
    });
    if (!form) throw new NotFoundException('Formulário não encontrado');
    // Buscar total de colaboradores da organização (via department -> organizationId)
    let totalExpected = 0;
    if (form.organizationId) {
      totalExpected = await this.prisma.profile.count({
        where: {
          department: {
            organizationId: form.organizationId,
          },
          deletedAt: null,
        },
      });
    }
    // Inferir tipo do formulário pelo campo type, senão slug
    let formType = form.type || null;
    if (!formType) {
      if (form.slug?.toLowerCase().includes('dass21')) formType = 'DASS21';
      else formType = 'COPSOQ';
    }
    const driver = this.drivers[formType];
    if (!driver)
      throw new NotFoundException(
        'Driver de análise não implementado para este tipo de formulário',
      );
    // Coletar todas as respostas e perguntas
    const questions = form.questions.map(
      (fq: any) => fq.question,
    ) as question[];
    const answers = form.submittedForms.flatMap(
      (sf: any) => sf.answers,
    ) as answer[];
    // Passar submittedForms e totalExpected para o driver
    return driver.analyze(
      answers,
      questions,
      form.submittedForms,
      totalExpected,
    );
  }

  // 1. Overview do formulário (com departments detalhado)
  async getFormOverview(formId: string) {
    // Buscar o formulário para obter a organização
    const formBasic = await this.prisma.form.findUnique({
      where: { id: formId },
      select: { organizationId: true },
    });
    if (!formBasic?.organizationId)
      throw new NotFoundException('Formulário ou organização não encontrada');

    // Buscar todos os departamentos da organização
    const departments = await this.prisma.department.findMany({
      where: { organizationId: formBasic.organizationId },
      select: { id: true, name: true },
    });

    // Buscar o formulário com questões para calcular scores
    const formWithQuestions = await this.prisma.form.findUnique({
      where: { id: formId },
      include: { questions: { include: { question: true } } },
    });
    if (!formWithQuestions) throw new NotFoundException('Formulário não encontrado');

    // Para cada departamento, buscar perfis e submittedForms desses perfis para o formId
    const departmentData = await Promise.all(
      departments.map(async (dept) => {
        // Buscar perfis do departamento
        const profiles = await this.prisma.profile.findMany({
          where: { departmentId: dept.id, deletedAt: null },
          select: { id: true },
        });
        const profileIds = profiles.map((p) => p.id);
        // Buscar submittedForms desses perfis para o formId
        const submittedForms = await this.prisma.submittedForm.findMany({
          where: { formId, profileId: { in: profileIds }, deletedAt: null },
          include: { answers: true },
        });
        // Score médio do departamento usando FormsAnalysisService
        const scores: number[] = [];
        console.log(`🏢 Processando departamento ${dept.name}:`, { 
          profilesCount: profiles.length, 
          submittedFormsCount: submittedForms.length 
        });
        
        submittedForms.forEach((sf: any) => {
          sf.answers.forEach((answer: any) => {
            if (!answer.questionId) return;
            
            // Buscar a questão para obter as opções
            const question = formWithQuestions.questions.find((fq: any) => fq.questionId === answer.questionId)?.question;
            if (!question?.options) {
              console.log('⚠️ Questão sem opções:', answer.questionId);
              return;
            }
            
            // Usar a lógica de mapeamento de score do FormsAnalysisService
            const score = this.formsAnalysisService.mapAnswerToScore(
              { options: question.options },
              answer.value
            );
            console.log(`📊 Resposta: ${answer.value} -> Score: ${score}`);
            if (score !== null) {
              scores.push(score);
            }
          });
        });
        
        console.log(`📈 Scores calculados para ${dept.name}:`, scores);
        
        const avg = scores.length
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
        let risk: 'low' | 'medium' | 'high' = 'high';
        if (avg >= 80) risk = 'low';
        else if (avg >= 60) risk = 'medium';
        // Para compatibilidade com o frontend, retornar campos específicos
        // Como o WHO-5 só tem uma dimensão, vamos distribuir o score
        const workload = avg; // Usar o score geral para todas as dimensões
        const autonomy = avg;
        const support = avg;
        const recognition = avg;
        const balance = avg;
        
        return {
          id: dept.id,
          department: dept.name,
          collaborators: submittedForms.length,
          workload: Math.round(workload),
          autonomy: Math.round(autonomy),
          support: Math.round(support),
          recognition: Math.round(recognition),
          balance: Math.round(balance),
          averageScore: Math.round(avg),
          risk,
        };
      }),
    );

    // Calcular score médio geral
    const allScores = departmentData.flatMap((d) => d.averageScore);
    const averageScore = allScores.length
      ? allScores.reduce((a, b) => a + b, 0) / allScores.length
      : 0;
    // Total de colaboradores
    const totalCollaborators = departmentData.reduce(
      (sum, d) => sum + d.collaborators,
      0,
    );
    // Alertas: colaboradores com score < 60
    const alerts = departmentData.reduce(
      (sum, d) => sum + (d.risk === 'high' ? d.collaborators : 0),
      0,
    );
    // Distribuição de risco
    const riskDistribution = {
      low: departmentData
        .filter((d) => d.risk === 'low')
        .reduce((sum, d) => sum + d.collaborators, 0),
      medium: departmentData
        .filter((d) => d.risk === 'medium')
        .reduce((sum, d) => sum + d.collaborators, 0),
      high: departmentData
        .filter((d) => d.risk === 'high')
        .reduce((sum, d) => sum + d.collaborators, 0),
    };
    console.log('🏆 Resultado final do analytics:', {
      averageScore,
      totalCollaborators,
      alerts,
      riskDistribution,
      departmentsCount: departmentData.length
    });
    
    return {
      averageScore: Math.round(averageScore),
      totalCollaborators,
      alerts,
      riskDistribution,
      departments: departmentData,
    };
  }

  // 2. Dados por departamento
  async getFormByDepartment(formId: string, departmentId: string) {
    // Busca colaboradores do departamento
    const employees = await this.prisma.profile.findMany({
      where: {
        departmentId,
        deletedAt: null,
      },
      select: { id: true, name: true, role: true },
    });
    // Busca submittedForms desses colaboradores para o form
    const submittedForms = await this.prisma.submittedForm.findMany({
      where: {
        formId,
        profileId: { in: employees.map((e) => e.id) },
        deletedAt: null,
      },
      include: { answers: true },
    });
    // Busca perguntas do formulário
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: { questions: { include: { question: true } } },
    });
    const questions = form?.questions.map(
      (fq: any) => fq.question,
    ) as question[];
    const answers = submittedForms.flatMap((sf: any) => sf.answers) as answer[];
    // Executa análise COPSOQ
    const driver = this.drivers['COPSOQ'];
    const analytics = driver.analyze(
      answers,
      questions,
      submittedForms,
      employees.length,
    );
    // Alerts: colaboradores do depto com score < 60
    const alerts = analytics.riskAlto;
    // Risk distribution por dimensão
    const riskDistribution = analytics.dimensions.map((d) => ({
      dimension: d.name,
      risk: d.risk,
      score: d.score,
    }));
    return {
      averageScore: analytics.overallScore,
      totalCollaborators: employees.length,
      alerts,
      employees,
      riskDistribution,
    };
  }

  // 3. Dados de um colaborador
  async getFormEmployee(formId: string, employeeId: string) {
    // Busca colaborador
    const employee = await this.prisma.profile.findUnique({
      where: { id: employeeId },
      select: { id: true, name: true, role: true },
    });
    if (!employee) throw new NotFoundException('Colaborador não encontrado');
    // Busca submittedForm desse colaborador para o form
    const submittedForm = await this.prisma.submittedForm.findFirst({
      where: { formId, profileId: employeeId, deletedAt: null },
      include: { answers: true },
    });
    if (!submittedForm) {
      return {
        name: employee.name,
        role: employee.role,
        score: null,
        risk: null,
        dimensionScores: [],
      };
    }
    // Busca perguntas do formulário
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: { questions: { include: { question: true } } },
    });
    const questions = form?.questions.map(
      (fq: any) => fq.question,
    ) as question[];
    const answers = submittedForm.answers;
    // Executa análise COPSOQ para esse colaborador
    const driver = this.drivers['COPSOQ'];
    // Para análise individual, passamos só as respostas desse colaborador
    const analytics = driver.analyze(answers, questions, [submittedForm], 1);
    // Score geral e risco
    const score = analytics.overallScore;
    // Risco geral: se alguma dimensão for high, risco é high, senão se alguma for medium, risco é medium, senão low
    let risk = 'low';
    if (analytics.dimensions.some((d) => d.risk === 'high')) risk = 'high';
    else if (analytics.dimensions.some((d) => d.risk === 'medium'))
      risk = 'medium';
    // Scores por dimensão
    const dimensionScores = analytics.dimensions.map((d) => ({
      dimension: d.name,
      score: d.score,
      risk: d.risk,
    }));
    return {
      name: employee.name,
      role: employee.role,
      score,
      risk,
      dimensionScores,
    };
  }

  async getFormAlerts(formId: string) {
    // Buscar todas as perguntas do formulário (com dimensão)
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        questions: { include: { question: true } },
      },
    });
    if (!form) throw new Error('Formulário não encontrado');
    const questions = form.questions.map((fq: any) => fq.question);

    // Buscar todos os submittedForms e respostas desse formulário
    const submittedForms = await this.prisma.submittedForm.findMany({
      where: { formId, deletedAt: null },
      include: { answers: true },
    });

    // Agrupar respostas por dimensão
    const dimensionScores: Record<string, number[]> = {};
    for (const sf of submittedForms) {
      for (const answer of sf.answers) {
        const question = questions.find((q) => q.id === answer.questionId);
        if (!question) continue;
        const dim = question.dimension;
        const value =
          typeof answer.value === 'number'
            ? answer.value
            : Number(answer.value);
        if (isNaN(value)) continue;
        if (!dimensionScores[dim]) dimensionScores[dim] = [];
        dimensionScores[dim].push(value);
      }
    }

    // Calcular média por dimensão
    const dimensionAverages: Record<string, number> = {};
    for (const dim in dimensionScores) {
      const arr = dimensionScores[dim];
      dimensionAverages[dim] = arr.length
        ? arr.reduce((a, b) => a + b, 0) / arr.length
        : 0;
    }

    // Gerar alertas críticos (score < 50)
    const critical = Object.entries(dimensionAverages)
      .filter(([_, avg]) => avg < 50)
      .map(([dim, avg]) => ({
        title: `Risco em ${dim}`,
        message: `A dimensão ${dim} teve média de ${Math.round(avg)} pontos. Isso representa risco elevado.`,
      }));

    // Gerar recomendações (score < 75)
    const recommendations = Object.entries(dimensionAverages)
      .filter(([_, avg]) => avg < 75)
      .map(([dim, avg]) => ({
        title: `Ação para ${dim}`,
        message: getRecommendationMessage(dim, avg),
      }));

    return { critical, recommendations };

    // Função simples para recomendações customizadas
    function getRecommendationMessage(dim: string, avg: number) {
      // Exemplos de recomendações customizadas
      if (dim.toLowerCase().includes('autonomia')) {
        return 'Recomenda-se plano de desenvolvimento pessoal para aumentar a autonomia dos colaboradores.';
      }
      if (dim.toLowerCase().includes('sobrecarga')) {
        return 'Recomenda-se workshop de gestão de tempo para lidar com sobrecarga.';
      }
      if (dim.toLowerCase().includes('reconhecimento')) {
        return 'Recomenda-se programa de reconhecimento e valorização dos colaboradores.';
      }
      if (dim.toLowerCase().includes('comunicação')) {
        return 'Recomenda-se treinamento em comunicação assertiva.';
      }
      // Genérico
      return `A dimensão ${dim} ficou abaixo da meta (${Math.round(avg)} pontos). Recomenda-se análise detalhada e plano de ação.`;
    }
  }

  async getGroupedAnalytics(formId: string, department?: string) {
    console.log(`🎯 [AnalyticsService] Buscando analytics agrupados para form ${formId}, department: ${department || 'all'}`);

    // Buscar o formulário com questões e grupos, ordenado
    const form = await this.prisma.form.findUnique({
      where: { id: formId },
      include: {
        questions: {
          include: {
            question: {
              include: {
                questionGroup: true
              }
            }
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    if (!form) {
      throw new NotFoundException('Formulário não encontrado');
    }

    // Buscar respostas filtradas por departamento se especificado
    let whereClause: any = {
      formId,
      deletedAt: null
    };

    if (department && department !== 'all') {
      whereClause.profile = {
        department: {
          name: department
        }
      };
    }

    const submittedForms = await this.prisma.submittedForm.findMany({
      where: whereClause,
      include: {
        answers: true,
        profile: {
          include: {
            department: true
          }
        }
      }
    });

    console.log(`📊 [AnalyticsService] Encontradas ${submittedForms.length} respostas submetidas`);

    // Agrupar questões por questionGroup e processar dados
    const groupsMap = new Map();

    for (const formQuestion of form.questions) {
      const question = formQuestion.question;
      const group = question.questionGroup;
      
      if (!group) continue;

      if (!groupsMap.has(group.id)) {
        groupsMap.set(group.id, {
          id: group.id,
          name: group.name,
          label: group.label || group.name,
          order: group.order || 999,
          questions: []
        });
      }

      // Calcular distribuição de respostas para esta questão
      const questionAnswers = submittedForms.flatMap(sf => 
        sf.answers.filter(a => a.questionId === question.id)
      );

      const distribution = this.calculateDistribution(question, questionAnswers);
      const averageScore = this.calculateAverageScore(questionAnswers);
      const risk = this.calculateRiskLevel(distribution);

      groupsMap.get(group.id).questions.push({
        id: question.id,
        code: question.code || `Q${formQuestion.order}`,
        text: question.text,
        type: question.type,
        order: formQuestion.order || 999,
        options: question.options,
        distribution,
        averageScore,
        totalResponses: questionAnswers.length,
        risk
      });
    }

    // Converter para array e ordenar
    const groups = Array.from(groupsMap.values())
      .sort((a, b) => a.order - b.order)
      .map(group => ({
        ...group,
        questions: group.questions.sort((a: any, b: any) => a.order - b.order)
      }));

    console.log(`✅ [AnalyticsService] Processados ${groups.length} grupos com questões ordenadas`);

    return {
      formId,
      formTitle: form.title,
      department: department || 'all',
      totalResponses: submittedForms.length,
      groups
    };
  }

  private calculateDistribution(question: any, answers: any[]) {
    const distribution: any[] = [];
    
    if (!question.options || !Array.isArray(question.options)) {
      return distribution;
    }

    // Contar respostas por opção
    const counts = new Map();
    const total = answers.length;

    answers.forEach(answer => {
      // Normalizar o valor - converter string para número se possível
      let value = answer.value;
      if (typeof value === 'string' && !isNaN(Number(value))) {
        value = Number(value);
      }
      counts.set(value, (counts.get(value) || 0) + 1);
    });

    // Criar distribuição baseada nas opções da questão
    question.options.forEach((option: any) => {
      const value = option.value !== undefined ? option.value : option;
      const label = option.label || option;
      // Buscar por string e número
      const count = (counts.get(value) || 0) + (counts.get(String(value)) || 0);
      const percentage = total > 0 ? (count / total) * 100 : 0;

      distribution.push({
        value,
        label,
        count,
        percentage
      });
    });

    return distribution.sort((a, b) => a.value - b.value);
  }

  private calculateAverageScore(answers: any[]): number {
    if (answers.length === 0) return 0;
    
    const validAnswers = answers.filter(a => 
      typeof a.value === 'number' || !isNaN(Number(a.value))
    );
    
    if (validAnswers.length === 0) return 0;
    
    const sum = validAnswers.reduce((acc, answer) => acc + Number(answer.value), 0);
    return sum / validAnswers.length;
  }

  private calculateRiskLevel(distribution: any[]): 'low' | 'medium' | 'high' {
    if (distribution.length === 0) return 'low';
    
    // Considerar valores baixos (1-2) como negativos
    const negativePercentage = distribution
      .filter(d => d.value <= 2)
      .reduce((sum, d) => sum + d.percentage, 0);
    
    if (negativePercentage > 60) return 'high';
    if (negativePercentage > 30) return 'medium';
    return 'low';
  }
}
