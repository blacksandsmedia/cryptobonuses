-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('MISLEADING_BONUS', 'FAKE_REVIEWS', 'PAYMENT_ISSUES', 'UNFAIR_TERMS', 'SCAM_SUSPICIOUS', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'DISMISSED');

-- CreateTable
CREATE TABLE "CasinoReport" (
    "id" TEXT NOT NULL,
    "casinoId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "reporterIp" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CasinoReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CasinoReport_casinoId_idx" ON "CasinoReport"("casinoId");

-- CreateIndex
CREATE INDEX "CasinoReport_status_idx" ON "CasinoReport"("status");

-- CreateIndex
CREATE INDEX "CasinoReport_createdAt_idx" ON "CasinoReport"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CasinoReport_casinoId_reporterIp_key" ON "CasinoReport"("casinoId", "reporterIp");

-- AddForeignKey
ALTER TABLE "CasinoReport" ADD CONSTRAINT "CasinoReport_casinoId_fkey" FOREIGN KEY ("casinoId") REFERENCES "Casino"("id") ON DELETE CASCADE ON UPDATE CASCADE;
