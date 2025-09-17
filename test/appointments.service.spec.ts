import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentsService } from '../src/appointments/appointments.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { NotificationsService } from '../src/notifications/notifications.service';

describe('AppointmentsService - Notificações', () => {
  let service: AppointmentsService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;

  const mockPrismaService = {
    appointment: {
      create: jest.fn(),
    },
  };

  const mockNotificationsService = {
    createNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve criar uma notificação para o profissional quando uma nova consulta é agendada', async () => {
    const profileId = 'user-1';
    const professionalId = 'prof-1';

    const dto = {
      title: 'Sessão',
      description: 'Sessão de acompanhamento',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      location: 'Online',
      notes: 'Traga exames',
      appointmentType: 'regular',
      professionalId,
    } as any;

    const createdAppointment = { id: 'appt-1', ...dto, startTime: new Date(dto.startTime), endTime: new Date(dto.endTime), status: 'scheduled', profileId };

    (prismaService.appointment.create as jest.Mock).mockResolvedValue(createdAppointment);

    const result = await service.create(dto, profileId);

    expect(result).toBeDefined();
    expect(prismaService.appointment.create).toHaveBeenCalledTimes(1);
    expect(mockNotificationsService.createNotification).toHaveBeenCalledTimes(1);
    expect(mockNotificationsService.createNotification).toHaveBeenCalledWith({
      profileId: professionalId,
      title: 'Nova consulta agendada',
      message: expect.stringContaining('foi agendada'),
    });
  });

  it('deve notificar o usuário quando a consulta for confirmada pelo profissional', async () => {
    const appointmentId = 'appt-1';
    const existingAppt = {
      id: appointmentId,
      status: 'scheduled',
      profileId: 'user-abc',
      professionalId: 'prof-1',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
    } as any;

    (mockPrismaService as any).appointment.findUnique = jest.fn().mockResolvedValue(existingAppt);
    (mockPrismaService as any).appointment.update = jest.fn().mockResolvedValue({ ...existingAppt, status: 'confirmed' });

    const updateDto = { status: 'confirmed' } as any;
    const result = await service.update(appointmentId, updateDto);

    expect(result.status).toBe('confirmed');
    expect((mockPrismaService as any).appointment.update).toHaveBeenCalledTimes(1);
    expect(mockNotificationsService.createNotification).toHaveBeenCalledWith({
      profileId: existingAppt.profileId,
      title: 'Consulta confirmada',
      message: expect.stringContaining('sua consulta foi confirmada'),
    });
  });

  it('deve notificar o usuário quando a consulta for cancelada', async () => {
    const appointmentId = 'appt-2';
    const existingAppt = {
      id: appointmentId,
      status: 'scheduled',
      profileId: 'user-xyz',
      professionalId: 'prof-2',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
    } as any;

    (mockPrismaService as any).appointment.findUnique = jest.fn().mockResolvedValue(existingAppt);
    (mockPrismaService as any).appointment.update = jest.fn().mockResolvedValue({ ...existingAppt, status: 'cancelled' });

    const updateDto = { status: 'cancelled' } as any;
    const result = await service.update(appointmentId, updateDto);

    expect(result.status).toBe('cancelled');
    expect(mockNotificationsService.createNotification).toHaveBeenCalledWith({
      profileId: existingAppt.profileId,
      title: 'Consulta cancelada',
      message: expect.stringContaining('sua consulta foi cancelada'),
    });
  });

  it('deve notificar o usuário quando a consulta for reagendada', async () => {
    const appointmentId = 'appt-3';
    const existingAppt = {
      id: appointmentId,
      status: 'scheduled',
      profileId: 'user-xyz',
      professionalId: 'prof-2',
      startTime: new Date(),
      endTime: new Date(Date.now() + 3600000),
    } as any;

    (mockPrismaService as any).appointment.findUnique = jest.fn().mockResolvedValue(existingAppt);
    (mockPrismaService as any).appointment.update = jest.fn().mockResolvedValue({ ...existingAppt, status: 'rescheduled', startTime: new Date(Date.now() + 7200000), endTime: new Date(Date.now() + 10800000) });

    const rescheduleDto = { startTime: new Date(Date.now() + 7200000).toISOString(), endTime: new Date(Date.now() + 10800000).toISOString(), status: 'rescheduled' } as any;
    const result = await service.update(appointmentId, rescheduleDto);

    expect(result.status).toBe('rescheduled');
    expect(mockNotificationsService.createNotification).toHaveBeenCalledWith({
      profileId: existingAppt.profileId,
      title: 'Consulta reagendada',
      message: expect.stringContaining('foi reagendada'),
    });
  });
});
