import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // IMPORTA O CONFIG MODULE
import { AnalyticsModule } from './analytics/analytics.module';
import { AnswersModule } from './answers/answers.module';
import { ApiRootController } from './api-root.controller';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { ProjectsModule } from './projects/projects.module';
import { HistoryModule } from './history/history.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { CoursesModule } from './courses/courses.module';
import { DashboardController } from './dashboard/dashboard.controller';
import { DepartmentsModule } from './departments/departments.module';
import { EmailModule } from './email/email.module';
import { FormsModule } from './forms/forms.module';
import { GenericModule } from './generic/generic.module';
import { GroupsModule } from './groups/groups.module';
import { LeadsModule } from './leads/leads.module';
import { LessonsModule } from './lessons/lessons.module';
import { ModulesModule } from './modules/modules.module';
import { OrganizationMembersModule } from './organization-members/organization-members.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { ProfilesModule } from './profiles/profiles.module';
import { QuestionsModule } from './questions/questions.module';
import { UtilsModule } from './shared/utils/utils.module';
import { SubmittedFormsModule } from './submitted-forms/submitted-forms.module';
import { TrailsModule } from './trails/trails.module';
import { UserCourseProgressModule } from './user-course-progress/user-course-progress.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // torna disponível globalmente
      envFilePath: '.env', // caminho relativo do seu arquivo .env
    }),
    UtilsModule,
    ProfilesModule,
    AuthModule,
    TrailsModule,
    CoursesModule,
    ModulesModule,
    LessonsModule,
    DepartmentsModule,
    GroupsModule,
    LeadsModule,
    EmailModule,
    FormsModule,
    OrganizationMembersModule,
    QuestionsModule,
    SubmittedFormsModule,
    OrganizationsModule,
    AnswersModule,
    AnalyticsModule,
    GenericModule,
    HistoryModule,
    AppointmentsModule,
    UserCourseProgressModule,
    CampaignsModule,
    ProjectsModule,
  ],
  controllers: [AppController, ApiRootController, DashboardController],
  providers: [AppService],
})
export class AppModule {}
