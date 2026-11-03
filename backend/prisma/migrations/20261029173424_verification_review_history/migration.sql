-- CreateTable
CREATE TABLE "verification_reviews" (
    "id" TEXT NOT NULL,
    "verificationId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "decision" "VerificationStatus" NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "verification_reviews_verificationId_idx" ON "verification_reviews"("verificationId");

-- AddForeignKey
ALTER TABLE "verification_reviews" ADD CONSTRAINT "verification_reviews_verificationId_fkey" FOREIGN KEY ("verificationId") REFERENCES "advisor_verifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_reviews" ADD CONSTRAINT "verification_reviews_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
