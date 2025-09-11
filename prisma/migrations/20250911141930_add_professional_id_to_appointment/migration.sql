-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."AppointmentType" ADD VALUE 'follow_up';
ALTER TYPE "public"."AppointmentType" ADD VALUE 'consultation';

-- AlterTable
ALTER TABLE "public"."appointment" ADD COLUMN     "professional_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."appointment" ADD CONSTRAINT "appointment_professional_id_fkey" FOREIGN KEY ("professional_id") REFERENCES "public"."profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
