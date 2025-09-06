-- AlterTable
ALTER TABLE "public"."project" ADD COLUMN     "campaign_id" TEXT;

-- AddForeignKey
ALTER TABLE "public"."project" ADD CONSTRAINT "project_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;
