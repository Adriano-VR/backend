/*
  Warnings:

  - You are about to drop the column `campaign_id` on the `project` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."project" DROP CONSTRAINT "project_campaign_id_fkey";

-- AlterTable
ALTER TABLE "public"."project" DROP COLUMN "campaign_id";
