/*
  Warnings:

  - The values [manager] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "public"."Role_new" AS ENUM ('super_admin', 'executive', 'admin', 'collaborator', 'professional', 'support', 'preset');
ALTER TABLE "public"."profile" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "public"."profile" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TABLE "public"."organization_member" ALTER COLUMN "role" TYPE "public"."Role_new" USING ("role"::text::"public"."Role_new");
ALTER TYPE "public"."Role" RENAME TO "Role_old";
ALTER TYPE "public"."Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "public"."profile" ALTER COLUMN "role" SET DEFAULT 'preset';
COMMIT;
