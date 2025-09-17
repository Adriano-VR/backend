import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  RescheduleAppointmentDto,
  CreateEmergencyAppointmentDto,
  CreateVirtualAgentAppointmentDto,
} from './dto';

@Injectable()
export class AppointmentsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto, profileId: string) {
    const { title, description, startTime, endTime, location, notes, appointmentType = 'regular', professionalId } =
      createAppointmentDto;

    const appointment = await this.prisma.appointment.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'scheduled',
        appointmentType,
        location,
        notes,
        profileId: profileId,
        professionalId: professionalId,
      },
    });
    if (professionalId) {
      await this.notificationsService.createNotification({
        profileId: professionalId,
        title: 'Nova consulta agendada',
        message: `Uma nova consulta foi agendada para ${new Date(startTime).toLocaleString()}.`,
      });
    }
    return appointment;
  }

  async findByProfile(profileId: string) {
    return this.prisma.appointment.findMany({
      where: {
        profileId: profileId,
        deletedAt: null,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async findByProfessional(professionalId: string) {
    return this.prisma.appointment.findMany({
      where: {
        professionalId: professionalId,
        deletedAt: null,
      },
      include: {
        profile: {
          select: {
            id: true,
            name: true,
            email: true,
            whatsapp: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async findNextByProfile(profileId: string) {
    const now = new Date();

    return this.prisma.appointment.findFirst({
      where: {
        profileId: profileId,
        startTime: {
          gte: now,
        },
        status: {
          not: 'cancelled',
        },
        deletedAt: null,
      },
      orderBy: {
        startTime: 'asc',
      },
    });
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: {
        ...updateAppointmentDto,
        ...(updateAppointmentDto.startTime && {
          startTime: new Date(updateAppointmentDto.startTime),
        }),
        ...(updateAppointmentDto.endTime && {
          endTime: new Date(updateAppointmentDto.endTime),
        }),
      },
    });

    // Gatilhos por status
    if (appointment?.profileId && updateAppointmentDto.status) {
      if (updateAppointmentDto.status === 'confirmed') {
        await this.notificationsService.createNotification({
          profileId: appointment.profileId,
          title: 'Consulta confirmada',
          message: 'Sua consulta foi confirmada pelo profissional.',
        });
      }
      if (updateAppointmentDto.status === 'cancelled') {
        await this.notificationsService.createNotification({
          profileId: appointment.profileId,
          title: 'Consulta cancelada',
          message: 'Sua consulta foi cancelada. Agende um novo horário se necessário.',
        });
      }
      if (updateAppointmentDto.status === 'rescheduled') {
        const newStart = (updateAppointmentDto as any).startTime || updated.startTime;
        await this.notificationsService.createNotification({
          profileId: appointment.profileId,
          title: 'Consulta reagendada',
          message: `Sua consulta foi reagendada para ${new Date(newStart).toLocaleString()}.`,
        });
      }
    }

    return updated;
  }

  async reschedule(id: string, rescheduleDto: RescheduleAppointmentDto) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    const { novaData, novoHorario } = rescheduleDto;

    // Calcular novos horários
    const startDateTime = new Date(novaData);
    const [startHour, startMinute] = novoHorario.split(':');
    startDateTime.setHours(parseInt(startHour), parseInt(startMinute));

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + 60); // 1 hora de duração

    return this.prisma.appointment.update({
      where: { id },
      data: {
        startTime: startDateTime,
        endTime: endDateTime,
        status: 'rescheduled',
      },
    });
  }

  async remove(id: string) {
    const appointment = await this.prisma.appointment.findUnique({
      where: { id },
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return this.prisma.appointment.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async createEmergency(createEmergencyDto: CreateEmergencyAppointmentDto, profileId: string) {
    const { description, notes } = createEmergencyDto;
    const now = new Date();
    const endTime = new Date(now.getTime() + 60 * 60 * 1000); // 1 hora de duração

    const appointment = await this.prisma.appointment.create({
      data: {
        title: 'Atendimento de Emergência',
        description,
        startTime: now,
        endTime: endTime,
        status: 'scheduled',
        appointmentType: 'emergency',
        location: 'Online - Emergência',
        notes,
        profileId: profileId,
      },
    });

    // Criar notificação para o usuário
    await this.prisma.notification.create({
      data: {
        title: 'Atendimento de Emergência Solicitado',
        message: 'Sua solicitação de atendimento de emergência foi enviada. Um profissional entrará em contato em breve.',
        profileId: profileId,
      },
    });

    // Notificar profissionais (buscar todos os profissionais)
    const professionals = await this.prisma.profile.findMany({
      where: {
        role: 'professional',
      },
    });

    for (const professional of professionals) {
      await this.prisma.notification.create({
        data: {
          title: 'Nova Solicitação de Emergência',
          message: `Nova solicitação de atendimento de emergência recebida. Descrição: ${description}`,
          profileId: professional.id,
        },
      });
    }

    return appointment;
  }

  async createVirtualAgent(createVirtualAgentDto: CreateVirtualAgentAppointmentDto, profileId: string) {
    const { description, notes } = createVirtualAgentDto;
    const now = new Date();
    const endTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutos de duração

    return this.prisma.appointment.create({
      data: {
        title: 'Atendimento com Agente Virtual',
        description,
        startTime: now,
        endTime: endTime,
        status: 'scheduled',
        appointmentType: 'virtual_agent',
        location: 'Chat Virtual',
        notes,
        profileId: profileId,
      },
    });
  }

  async findByType(profileId: string, appointmentType: 'regular' | 'emergency' | 'virtual_agent') {
    return this.prisma.appointment.findMany({
      where: {
        profileId: profileId,
        appointmentType: appointmentType,
        deletedAt: null,
      },
      orderBy: {
        startTime: 'desc',
      },
    });
  }

  async getProfessionalStatistics(professionalId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Total de pacientes únicos
    const totalPatients = await this.prisma.appointment.groupBy({
      by: ['profileId'],
      where: {
        professionalId: professionalId,
        deletedAt: null,
      },
    });

    // Novos pacientes este mês
    const newPatientsThisMonth = await this.prisma.appointment.groupBy({
      by: ['profileId'],
      where: {
        professionalId: professionalId,
        deletedAt: null,
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // Avaliações pendentes (consultas agendadas)
    const pendingAppointments = await this.prisma.appointment.count({
      where: {
        professionalId: professionalId,
        status: 'scheduled',
        deletedAt: null,
        startTime: {
          gte: now,
        },
      },
    });

    // Avaliações com prazo próximo (próximos 3 dias)
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const appointmentsNearDeadline = await this.prisma.appointment.count({
      where: {
        professionalId: professionalId,
        status: 'scheduled',
        deletedAt: null,
        startTime: {
          gte: now,
          lte: threeDaysFromNow,
        },
      },
    });

    // Sessões realizadas este mês
    const sessionsThisMonth = await this.prisma.appointment.count({
      where: {
        professionalId: professionalId,
        status: 'completed',
        deletedAt: null,
        startTime: {
          gte: startOfMonth,
        },
      },
    });

    // Sessões realizadas no mês anterior
    const sessionsLastMonth = await this.prisma.appointment.count({
      where: {
        professionalId: professionalId,
        status: 'completed',
        deletedAt: null,
        startTime: {
          gte: startOfLastMonth,
          lte: endOfLastMonth,
        },
      },
    });

    // Calcular percentual de crescimento
    const growthPercentage = sessionsLastMonth > 0 
      ? Math.round(((sessionsThisMonth - sessionsLastMonth) / sessionsLastMonth) * 100)
      : sessionsThisMonth > 0 ? 100 : 0;

    // Média de satisfação (simulada por enquanto - pode ser implementada com avaliações reais)
    const averageSatisfaction = 4.9;
    const satisfactionGrowth = 0.3;

    return {
      totalPatients: totalPatients.length,
      newPatientsThisMonth: newPatientsThisMonth.length,
      pendingAppointments,
      appointmentsNearDeadline,
      sessionsThisMonth,
      growthPercentage,
      averageSatisfaction,
      satisfactionGrowth,
    };
  }
}
