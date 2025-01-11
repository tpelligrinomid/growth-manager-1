/*
  Warnings:

  - You are about to alter the column `pointsPurchased` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `pointsDelivered` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `recurringPointsAllotment` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `mrr` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `growthInMrr` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `potentialMrr` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `annualRevenue` on the `Account` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `progress` on the `Goal` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Account" ALTER COLUMN "pointsPurchased" SET DATA TYPE INTEGER,
ALTER COLUMN "pointsDelivered" SET DATA TYPE INTEGER,
ALTER COLUMN "recurringPointsAllotment" SET DATA TYPE INTEGER,
ALTER COLUMN "mrr" SET DATA TYPE INTEGER,
ALTER COLUMN "growthInMrr" SET DATA TYPE INTEGER,
ALTER COLUMN "potentialMrr" SET DATA TYPE INTEGER,
ALTER COLUMN "annualRevenue" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Goal" ALTER COLUMN "progress" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "Note" ALTER COLUMN "createdAt" DROP DEFAULT;
