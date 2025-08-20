import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import {
  CreateAppointmentDto,
  UpdateAppointmentDto,
  RescheduleAppointmentDto,
} from './dto';
import { AuthGuard } from '../auth/auth.guard';

@Controller('appointments')
@UseGuards(AuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  async create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @Request() req,
  ) {
    return this.appointmentsService.create(createAppointmentDto, req.user.sub);
  }

  @Get('profile/:profileId')
  async findByProfile(@Param('profileId') profileId: string) {
    return this.appointmentsService.findByProfile(profileId);
  }

  @Get('profile/:profileId/next')
  async findNextByProfile(@Param('profileId') profileId: string) {
    return this.appointmentsService.findNextByProfile(profileId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Put(':id/reschedule')
  async reschedule(
    @Param('id') id: string,
    @Body() rescheduleDto: RescheduleAppointmentDto,
  ) {
    return this.appointmentsService.reschedule(id, rescheduleDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }
}
