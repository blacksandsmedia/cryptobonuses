/*
  Warnings:

  - The values [MISLEADING_BONUS,PAYMENT_ISSUES,SCAM_SUSPICIOUS] on the enum `ReportReason` will be removed. If these variants are still used in the database, this will fail.
  - The values [UNDER_REVIEW,RESOLVED,DISMISSED] on the enum `ReportStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReportReason_new" AS ENUM ('MISLEADING_BONUSES', 'FAKE_REVIEWS', 'PAYMENT_DELAYS', 'UNFAIR_TERMS', 'SCAM_ACTIVITY', 'POOR_CUSTOMER_SERVICE', 'RIGGED_GAMES', 'IDENTITY_THEFT', 'OTHER');
ALTER TABLE "CasinoReport" ALTER COLUMN "reason" TYPE "ReportReason_new" USING ("reason"::text::"ReportReason_new");
ALTER TYPE "ReportReason" RENAME TO "ReportReason_old";
ALTER TYPE "ReportReason_new" RENAME TO "ReportReason";
DROP TYPE "ReportReason_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ReportStatus_new" AS ENUM ('PENDING', 'VERIFIED');
ALTER TABLE "CasinoReport" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "CasinoReport" ALTER COLUMN "status" TYPE "ReportStatus_new" USING ("status"::text::"ReportStatus_new");
ALTER TYPE "ReportStatus" RENAME TO "ReportStatus_old";
ALTER TYPE "ReportStatus_new" RENAME TO "ReportStatus";
DROP TYPE "ReportStatus_old";
ALTER TABLE "CasinoReport" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
