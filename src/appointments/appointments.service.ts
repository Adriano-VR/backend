import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  RescheduleAppointmentDto,
} from './dto';

@Injectable()
export class AppointmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto, profileId: string) {
    const { title, description, startTime, endTime, location, notes } =
      createAppointmentDto;

    return this.prisma.appointment.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'scheduled',
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
}
