-- CreateEnum
CREATE TYPE "BusinessUnit" AS ENUM ('NEW_NORTH', 'IDEOMETRY', 'MOTION', 'SPOKE');

-- CreateEnum
CREATE TYPE "EngagementType" AS ENUM ('STRATEGIC', 'TACTICAL');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('TIER_1', 'TIER_2', 'TIER_3', 'TIER_4');

-- CreateEnum
CREATE TYPE "Service" AS ENUM ('ABM', 'PAID', 'CONTENT', 'SEO', 'REPORTING', 'SOCIAL', 'WEBSITE');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "businessUnit" "BusinessUnit" NOT NULL,
    "engagementType" "EngagementType" NOT NULL,
    "priority" "Priority" NOT NULL,
    "accountManager" TEXT NOT NULL,
    "teamManager" TEXT NOT NULL,
    "relationshipStartDate" TIMESTAMP(3) NOT NULL,
    "contractStartDate" TIMESTAMP(3) NOT NULL,
    "contractRenewalEnd" TIMESTAMP(3) NOT NULL,
    "services" "Service"[],
    "pointsPurchased" DOUBLE PRECISION NOT NULL,
    "pointsDelivered" DOUBLE PRECISION NOT NULL,
    "delivery" TEXT NOT NULL,
    "recurringPointsAllotment" DOUBLE PRECISION NOT NULL,
    "mrr" DOUBLE PRECISION NOT NULL,
    "growthInMrr" DOUBLE PRECISION NOT NULL,
    "potentialMrr" DOUBLE PRECISION NOT NULL,
    "website" TEXT,
    "linkedinProfile" TEXT,
    "industry" TEXT NOT NULL,
    "annualRevenue" DOUBLE PRECISION NOT NULL,
    "employees" INTEGER NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "progress" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientContact" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "ClientContact_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientContact" ADD CONSTRAINT "ClientContact_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
