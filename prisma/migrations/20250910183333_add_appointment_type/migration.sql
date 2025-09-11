-- CreateEnum
CREATE TYPE "public"."AppointmentType" AS ENUM ('regular', 'emergency', 'virtual_agent');

-- AlterTable
ALTER TABLE "public"."appointment" ADD COLUMN     "appointment_type" "public"."AppointmentType" NOT NULL DEFAULT 'regular';
