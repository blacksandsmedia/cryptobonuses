-- CreateEnum
CREATE TYPE "Cryptocurrency" AS ENUM ('BITCOIN', 'ETHEREUM', 'LITECOIN', 'BITCOIN_CASH', 'RIPPLE', 'DOGECOIN', 'TETHER', 'CARDANO', 'POLYGON', 'BINANCE_COIN', 'SOLANA', 'AVALANCHE', 'CHAINLINK', 'UNISWAP', 'TRON', 'MONERO', 'DASH', 'ZCASH', 'STELLAR', 'COSMOS', 'POLKADOT', 'FANTOM', 'NEAR', 'ALGORAND', 'SHIBA_INU', 'USDC', 'USDT', 'BUSD', 'DAI', 'OTHER');

-- AlterTable
ALTER TABLE "Casino" ADD COLUMN     "acceptedCryptocurrencies" "Cryptocurrency"[] DEFAULT ARRAY[]::"Cryptocurrency"[],
ADD COLUMN     "licenseLocation" TEXT,
ADD COLUMN     "ownershipCompanyName" TEXT,
ADD COLUMN     "ownershipLicenseNumber" TEXT,
ADD COLUMN     "ownershipRegNumber" TEXT,
ADD COLUMN     "recommendedCasinoIds" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "cryptoTickerSelection" "Cryptocurrency"[] DEFAULT ARRAY['BITCOIN', 'ETHEREUM', 'CARDANO', 'POLKADOT', 'DOGECOIN', 'LITECOIN', 'CHAINLINK', 'SOLANA', 'POLYGON', 'AVALANCHE']::"Cryptocurrency"[],
ADD COLUMN     "googleAnalyticsId" TEXT,
ADD COLUMN     "hideBuyCryptoButton" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hideCryptoTicker" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "CodeFeedback" (
    "id" TEXT NOT NULL,
    "bonusId" TEXT NOT NULL,
    "userIp" TEXT NOT NULL,
    "worked" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CodeFeedback_bonusId_idx" ON "CodeFeedback"("bonusId");

-- CreateIndex
CREATE UNIQUE INDEX "CodeFeedback_bonusId_userIp_key" ON "CodeFeedback"("bonusId", "userIp");

-- AddForeignKey
ALTER TABLE "CodeFeedback" ADD CONSTRAINT "CodeFeedback_bonusId_fkey" FOREIGN KEY ("bonusId") REFERENCES "Bonus"("id") ON DELETE CASCADE ON UPDATE CASCADE; 