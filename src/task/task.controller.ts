import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common'
import { TaskService } from './task.service'
import { CreateTaskDto, UpdateTaskDto, TaskResponse } from '../types/task'
import { AuthGuard } from '../auth/auth.guard'

@Controller('tasks')
@UseGuards(AuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  create(@Body() createTaskDto: CreateTaskDto): Promise<TaskResponse> {
    return this.taskService.create(createTaskDto)
  }

  @Get()
  findAll(@Query('projectId') projectId?: string): Promise<TaskResponse[]> {
    return this.taskService.findAll(projectId)
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<TaskResponse> {
    return this.taskService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto): Promise<TaskResponse> {
    return this.taskService.update(id, updateTaskDto)
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: string): Promise<TaskResponse> {
    return this.taskService.updateStatus(id, status)
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.taskService.remove(id)
  }

  @Get('project/:projectId')
  findByProject(@Param('projectId') projectId: string): Promise<TaskResponse[]> {
    return this.taskService.findByProject(projectId)
  }
}
