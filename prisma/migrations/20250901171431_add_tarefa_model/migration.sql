-- CreateEnum
CREATE TYPE "public"."TarefaStatus" AS ENUM ('pendente', 'iniciado', 'concluido', 'cancelado');

-- AlterEnum
ALTER TYPE "public"."ProjectType" ADD VALUE 'checklist';

-- CreateTable
CREATE TABLE "public"."tarefa" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "responsavel" TEXT,
    "data_inicio" TIMESTAMP(3),
    "data_previsao_conclusao" TIMESTAMP(3),
    "data_conclusao" TIMESTAMP(3),
    "status" "public"."TarefaStatus" NOT NULL DEFAULT 'pendente',
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "tarefa_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."tarefa" ADD CONSTRAINT "tarefa_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
