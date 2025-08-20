-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('super_admin', 'executive', 'manager', 'collaborator', 'professional', 'support', 'preset');

-- CreateEnum
CREATE TYPE "public"."Sector" AS ENUM ('industry', 'service', 'commerce', 'other');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('pending', 'in_progress', 'completed');

-- CreateEnum
CREATE TYPE "public"."Nr1Status" AS ENUM ('never_heard_of_it', 'we_know_but_dont_do', 'choosing_solution', 'meeting_requirements');

-- CreateEnum
CREATE TYPE "public"."QuestionType" AS ENUM ('scale_frequency', 'scale_intensity', 'qualitative', 'multiple_choice', 'text', 'number');

-- CreateEnum
CREATE TYPE "public"."LeadFormType" AS ENUM ('RISK_CALCULATOR', 'DEMO_REQUEST', 'HOME_FORM');

-- CreateEnum
CREATE TYPE "public"."ProjectType" AS ENUM ('project', 'action_plan');

-- CreateEnum
CREATE TYPE "public"."ProgressStatus" AS ENUM ('in_progress', 'completed', 'not_started', 'abandoned');

-- CreateEnum
CREATE TYPE "public"."PermissionStatus" AS ENUM ('pending', 'active', 'suspended', 'removed');

-- CreateEnum
CREATE TYPE "public"."HistoryType" AS ENUM ('feeling', 'form');

-- CreateEnum
CREATE TYPE "public"."AppointmentStatus" AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled');

-- CreateTable
CREATE TABLE "public"."profile" (
    "id" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'preset',
    "name" TEXT NOT NULL,
    "profile_picture" TEXT,
    "completed_onboarding" BOOLEAN NOT NULL DEFAULT false,
    "personal_corp_email" TEXT,
    "display_name" TEXT,
    "slug" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "gender" TEXT,
    "birth_date" TIMESTAMP(3),
    "cpf" TEXT,
    "whatsapp" TEXT,
    "bio" TEXT,
    "email_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "job_title" TEXT,
    "settings" JSONB,
    "department_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logo" TEXT,
    "fantasy_name" TEXT,
    "cnpj" TEXT,
    "corporate_email" TEXT,
    "user_id" TEXT,
    "number_of_employees" TEXT,
    "whatsapp" TEXT,
    "invite_code" TEXT NOT NULL,
    "type" TEXT,
    "opening_date" TIMESTAMP(3),
    "situation" TEXT,
    "situation_date" TIMESTAMP(3),
    "situation_special" TEXT,
    "situation_special_date" TIMESTAMP(3),
    "legal_nature" TEXT,
    "company_size" TEXT,
    "main_activity" JSONB,
    "secondary_activities" JSONB,
    "qsa" JSONB,
    "capital_stock" TEXT,
    "efr" TEXT,
    "status" TEXT,
    "motive_situation" TEXT,
    "last_update" TIMESTAMP(3),
    "billing" JSONB,
    "simples" JSONB,
    "simei" JSONB,
    "extra" JSONB,
    "address_id" TEXT,
    "created_by_id" TEXT,
    "slug" TEXT NOT NULL,
    "number_of_collaborators" TEXT,
    "has_completed_onboarding" BOOLEAN NOT NULL DEFAULT false,
    "head_office_uuid" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "nr1_status" "public"."Nr1Status",
    "registration_code" TEXT,
    "settings" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "group_id" INTEGER,

    CONSTRAINT "organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."activity" (
    "id" TEXT NOT NULL,
    "cnae" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sector" "public"."Sector" NOT NULL,
    "organization_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."department" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "organization_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."group" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" TEXT,
    "organization_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."form" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "template_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" TEXT,
    "organization_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "limit_date" TIMESTAMP(3),
    "qualityDiagnosis" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."formQuestion" (
    "id" TEXT NOT NULL,
    "formId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "formQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question_group" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "meta" JSONB,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "question_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."question" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "dimension" TEXT NOT NULL,
    "comment" TEXT,
    "text" TEXT NOT NULL,
    "type" "public"."QuestionType" NOT NULL,
    "options" JSONB,
    "question_group_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."submitted_form" (
    "id" TEXT NOT NULL,
    "status" "public"."Status" NOT NULL DEFAULT 'pending',
    "completed_at" TIMESTAMP(3),
    "form_id" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "submitted_form_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."answer" (
    "id" TEXT NOT NULL,
    "value" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "questionId" TEXT,
    "submittedFormId" TEXT,

    CONSTRAINT "answer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."notification" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "user_id" TEXT,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."project" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "is_template" BOOLEAN NOT NULL DEFAULT false,
    "type" "public"."ProjectType" NOT NULL DEFAULT 'project',
    "description" TEXT,
    "problem" TEXT,
    "solution" TEXT,
    "impact" TEXT,
    "metrics" TEXT,
    "timeline" TEXT,
    "resources" TEXT,
    "risks" TEXT,
    "status" "public"."Status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by_id" TEXT,
    "organization_id" TEXT,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."action" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "project_id" TEXT,
    "status" "public"."Status" NOT NULL DEFAULT 'pending',
    "start_date" TIMESTAMP(3),
    "end_date" TIMESTAMP(3),
    "responsible" TEXT,
    "responsible_profile_id" TEXT,
    "resources" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "action_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lead" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT,
    "payload" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "form_type" "public"."LeadFormType" NOT NULL,
    "page_url" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "utm_campaign" TEXT,
    "utm_medium" TEXT,
    "utm_source" TEXT,

    CONSTRAINT "lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."trail" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "trail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."course" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "trail_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."module" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "course_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."lesson" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "module_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "lesson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."user_course_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "progress" DOUBLE PRECISION,
    "status" "public"."ProgressStatus" NOT NULL DEFAULT 'in_progress',
    "details" JSONB,

    CONSTRAINT "user_course_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."organization_member" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL,
    "status" "public"."PermissionStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "organization_member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."address" (
    "id" TEXT NOT NULL,
    "street" TEXT,
    "number" TEXT,
    "complement" TEXT,
    "district" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip_code" TEXT,

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."history" (
    "id" TEXT NOT NULL,
    "type" "public"."HistoryType" NOT NULL DEFAULT 'feeling',
    "data" JSONB NOT NULL,
    "profile_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."appointment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" "public"."AppointmentStatus" NOT NULL DEFAULT 'scheduled',
    "location" TEXT,
    "notes" TEXT,
    "profile_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "appointment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profile_id_key" ON "public"."profile"("id");

-- CreateIndex
CREATE UNIQUE INDEX "profile_slug_key" ON "public"."profile"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "profile_email_key" ON "public"."profile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profile_cpf_key" ON "public"."profile"("cpf");

-- CreateIndex
CREATE INDEX "profile_role_email_id_idx" ON "public"."profile"("role", "email", "id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_cnpj_key" ON "public"."organization"("cnpj");

-- CreateIndex
CREATE UNIQUE INDEX "organization_user_id_key" ON "public"."organization"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_invite_code_key" ON "public"."organization"("invite_code");

-- CreateIndex
CREATE UNIQUE INDEX "organization_slug_key" ON "public"."organization"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organization_head_office_uuid_key" ON "public"."organization"("head_office_uuid");

-- CreateIndex
CREATE UNIQUE INDEX "organization_registration_code_key" ON "public"."organization"("registration_code");

-- CreateIndex
CREATE UNIQUE INDEX "activity_slug_key" ON "public"."activity"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "activity_organization_id_key" ON "public"."activity"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "department_slug_key" ON "public"."department"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "group_slug_key" ON "public"."group"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "form_slug_key" ON "public"."form"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "question_group_id_key" ON "public"."question_group"("id");

-- CreateIndex
CREATE UNIQUE INDEX "question_group_slug_key" ON "public"."question_group"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "question_id_key" ON "public"."question"("id");

-- CreateIndex
CREATE UNIQUE INDEX "answer_submittedFormId_questionId_key" ON "public"."answer"("submittedFormId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "project_slug_key" ON "public"."project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "trail_slug_key" ON "public"."trail"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "course_slug_key" ON "public"."course"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "module_slug_key" ON "public"."module"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "lesson_slug_key" ON "public"."lesson"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "user_course_progress_user_id_course_id_key" ON "public"."user_course_progress"("user_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "organization_member_profile_id_organization_id_key" ON "public"."organization_member"("profile_id", "organization_id");

-- AddForeignKey
ALTER TABLE "public"."profile" ADD CONSTRAINT "profile_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "public"."department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization" ADD CONSTRAINT "organization_address_id_fkey" FOREIGN KEY ("address_id") REFERENCES "public"."address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization" ADD CONSTRAINT "organization_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization" ADD CONSTRAINT "organization_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."activity" ADD CONSTRAINT "activity_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."department" ADD CONSTRAINT "department_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."group" ADD CONSTRAINT "group_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."form" ADD CONSTRAINT "form_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "public"."form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."form" ADD CONSTRAINT "form_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."form" ADD CONSTRAINT "form_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."formQuestion" ADD CONSTRAINT "formQuestion_formId_fkey" FOREIGN KEY ("formId") REFERENCES "public"."form"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."formQuestion" ADD CONSTRAINT "formQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."question" ADD CONSTRAINT "question_question_group_id_fkey" FOREIGN KEY ("question_group_id") REFERENCES "public"."question_group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submitted_form" ADD CONSTRAINT "submitted_form_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "public"."form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."submitted_form" ADD CONSTRAINT "submitted_form_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answer" ADD CONSTRAINT "answer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "public"."question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."answer" ADD CONSTRAINT "answer_submittedFormId_fkey" FOREIGN KEY ("submittedFormId") REFERENCES "public"."submitted_form"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project" ADD CONSTRAINT "project_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "public"."profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."project" ADD CONSTRAINT "project_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."action" ADD CONSTRAINT "action_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."course" ADD CONSTRAINT "course_trail_id_fkey" FOREIGN KEY ("trail_id") REFERENCES "public"."trail"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."module" ADD CONSTRAINT "module_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."lesson" ADD CONSTRAINT "lesson_module_id_fkey" FOREIGN KEY ("module_id") REFERENCES "public"."module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_course_progress" ADD CONSTRAINT "user_course_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."user_course_progress" ADD CONSTRAINT "user_course_progress_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_member" ADD CONSTRAINT "organization_member_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."organization_member" ADD CONSTRAINT "organization_member_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."history" ADD CONSTRAINT "history_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."appointment" ADD CONSTRAINT "appointment_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
