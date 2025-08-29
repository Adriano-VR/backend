import { Controller, Post, Get, Put, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { UserCourseProgressService, CreateUserCourseProgressDto, UpdateUserCourseProgressDto } from './user-course-progress.service';
import { AuthGuard } from '../auth/auth.guard';

@Controller('user-course-progress')
@UseGuards(AuthGuard)
export class UserCourseProgressController {
  constructor(private readonly userCourseProgressService: UserCourseProgressService) {}

  @Post()
  async createProgress(@Body() data: CreateUserCourseProgressDto, @Request() req: any) {
    // Usar o ID do usuário autenticado
    const profileId = req.user?.sub || req.user?.id || data.profileId;
    return this.userCourseProgressService.createProgress({
      ...data,
      profileId,
    });
  }

  @Get(':courseId')
  async getProgress(@Param('courseId') courseId: string, @Request() req: any) {
    const profileId = req.user?.sub || req.user?.id;
    if (!profileId) {
      throw new Error('Usuário não autenticado');
    }
    return this.userCourseProgressService.getProgress(profileId, courseId);
  }

  @Put(':courseId')
  async updateProgress(
    @Param('courseId') courseId: string,
    @Body() data: UpdateUserCourseProgressDto,
    @Request() req: any,
  ) {
    const profileId = req.user?.sub || req.user?.id;
    if (!profileId) {
      throw new Error('Usuário não autenticado');
    }
    return this.userCourseProgressService.updateProgress(profileId, courseId, data);
  }

  @Post(':courseId/complete-lesson/:lessonId')
  async completeLesson(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @Request() req: any,
  ) {
    console.log('🔍 [Controller] completeLesson chamado com:', { courseId, lessonId })
    console.log('🔍 [Controller] req.user:', req.user)
    console.log('🔍 [Controller] req.headers:', req.headers)
    
    const profileId = req.user?.sub || req.user?.id;
    console.log('🔍 [Controller] profileId extraído:', profileId)
    
    if (!profileId) {
      console.error('❌ [Controller] Usuário não autenticado')
      throw new Error('Usuário não autenticado');
    }
    
    console.log('✅ [Controller] Chamando service com:', { profileId, courseId, lessonId })
    const result = await this.userCourseProgressService.completeLesson(profileId, courseId, lessonId)
    console.log('✅ [Controller] Resultado do service:', result)
    
    return result
  }

  @Get('profile/all')
  async getProgressByProfile(@Request() req: any) {
    const profileId = req.user?.sub || req.user?.id;
    if (!profileId) {
      throw new Error('Usuário não autenticado');
    }
    return this.userCourseProgressService.getProgressByProfile(profileId);
  }

  @Delete(':courseId')
  async deleteProgress(@Param('courseId') courseId: string, @Request() req: any) {
    const profileId = req.user?.sub || req.user?.id;
    if (!profileId) {
      throw new Error('Usuário não autenticado');
    }
    return this.userCourseProgressService.deleteProgress(profileId, courseId);
  }
}

