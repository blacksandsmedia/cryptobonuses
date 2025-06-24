-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "searchDebounceTime" INTEGER NOT NULL DEFAULT 2000,
ADD COLUMN     "searchInstantTrack" BOOLEAN NOT NULL DEFAULT true;
