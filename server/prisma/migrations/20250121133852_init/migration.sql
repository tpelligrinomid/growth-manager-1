-- CreateEnum
CREATE TYPE "BusinessUnit" AS ENUM ('NEW_NORTH', 'IDEOMETRY', 'MOTION', 'SPOKE');

-- CreateEnum
CREATE TYPE "EngagementType" AS ENUM ('STRATEGIC', 'TACTICAL');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('TIER_1', 'TIER_2', 'TIER_3', 'TIER_4');

-- CreateEnum
CREATE TYPE "Service" AS ENUM ('SOCIAL', 'WEBSITE', 'SEO', 'PPC', 'EMAIL', 'CONTENT');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GROWTH_MANAGER', 'ADMINISTRATOR', 'GROWTH_ADVISOR');

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
    "pointsStrikingDistance" DOUBLE PRECISION NOT NULL,
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
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "assignee" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "accountId" TEXT NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "progress" INTEGER NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientContact" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,

    CONSTRAINT "ClientContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "googleId" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'GROWTH_ADVISOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Goal" ADD CONSTRAINT "Goal_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientContact" ADD CONSTRAINT "ClientContact_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
