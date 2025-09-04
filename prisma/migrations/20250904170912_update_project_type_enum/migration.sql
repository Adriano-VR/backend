/*
  Warnings:

  - The values [project,action_plan] on the enum `ProjectType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."ProjectType_new" AS ENUM ('checklist', 'preventivo', 'contigencial');
ALTER TABLE "public"."project" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."project" ALTER COLUMN "type" TYPE "public"."ProjectType_new" USING ("type"::text::"public"."ProjectType_new");
ALTER TYPE "public"."ProjectType" RENAME TO "ProjectType_old";
ALTER TYPE "public"."ProjectType_new" RENAME TO "ProjectType";
DROP TYPE "public"."ProjectType_old";
ALTER TABLE "public"."project" ALTER COLUMN "type" SET DEFAULT 'checklist';
COMMIT;

-- AlterTable
ALTER TABLE "public"."project" ALTER COLUMN "type" SET DEFAULT 'checklist';
