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
    const { title, description, startTime, endTime, location, notes, appointmentType = 'regular' } =
      createAppointmentDto;

    return this.prisma.appointment.create({
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
      },
    });
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

    return this.prisma.appointment.update({
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
}
