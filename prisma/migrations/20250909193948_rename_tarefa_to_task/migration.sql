/*
  Warnings:

  - You are about to drop the `tarefa` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."TaskStatus" AS ENUM ('pendente', 'iniciado', 'concluido', 'cancelado');

-- DropForeignKey
ALTER TABLE "public"."tarefa" DROP CONSTRAINT "tarefa_project_id_fkey";

-- DropTable
DROP TABLE "public"."tarefa";

-- DropEnum
DROP TYPE "public"."TarefaStatus";

-- CreateTable
CREATE TABLE "public"."task" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT,
    "responsavel" TEXT,
    "data_inicio" TIMESTAMP(3),
    "data_previsao_conclusao" TIMESTAMP(3),
    "data_conclusao" TIMESTAMP(3),
    "status" "public"."TaskStatus" NOT NULL DEFAULT 'pendente',
    "project_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "task_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."task" ADD CONSTRAINT "task_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
