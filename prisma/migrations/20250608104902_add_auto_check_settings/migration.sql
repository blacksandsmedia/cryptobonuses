-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "autoCheckEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "autoCheckFrequency" TEXT NOT NULL DEFAULT 'weekly',
ADD COLUMN     "autoCheckUserId" TEXT;
