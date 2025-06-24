/*
  Warnings:

  - You are about to drop the column `type` on the `Bonus` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Bonus" DROP COLUMN "type",
ADD COLUMN     "types" "BonusType"[];
