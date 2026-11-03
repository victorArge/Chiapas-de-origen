-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('PRODUCER_MONTHLY', 'ADVISOR_MONTHLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('INITIAL', 'RENEWAL');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('IDENTIFICATION', 'PROOF_OF_STUDIES', 'PROFESSIONAL_LICENSE', 'CERTIFICATE', 'OTHER');

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "plan" "SubscriptionPlan" NOT NULL,
    "priceMxn" INTEGER NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "isTrial" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "amountMxn" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "type" "PaymentType" NOT NULL DEFAULT 'INITIAL',
    "reference" TEXT NOT NULL,
    "failureReason" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advisor_verifications" (
    "id" TEXT NOT NULL,
    "advisorProfileId" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "rejectionReason" TEXT,
    "submittedAt" TIMESTAMP(3),
    "reviewedAt" TIMESTAMP(3),
    "reviewedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advisor_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advisor_documents" (
    "id" TEXT NOT NULL,
    "verificationId" TEXT NOT NULL,
    "type" "DocumentType" NOT NULL DEFAULT 'OTHER',
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storagePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "advisor_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_userId_key" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_status_idx" ON "subscriptions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_reference_key" ON "payments"("reference");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_userId_idx" ON "payments"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "advisor_verifications_advisorProfileId_key" ON "advisor_verifications"("advisorProfileId");

-- CreateIndex
CREATE INDEX "advisor_verifications_status_idx" ON "advisor_verifications"("status");

-- CreateIndex
CREATE INDEX "advisor_documents_verificationId_idx" ON "advisor_documents"("verificationId");

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "subscriptions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advisor_verifications" ADD CONSTRAINT "advisor_verifications_advisorProfileId_fkey" FOREIGN KEY ("advisorProfileId") REFERENCES "advisor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advisor_verifications" ADD CONSTRAINT "advisor_verifications_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advisor_documents" ADD CONSTRAINT "advisor_documents_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "advisor_verifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
