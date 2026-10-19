-- CreateEnum
CREATE TYPE "Role" AS ENUM ('PRODUCER', 'ADVISOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'FINISHED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'PRODUCER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advisor_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "municipality" TEXT NOT NULL,
    "contactInformation" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advisor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advisory_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "advisory_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advisor_specialties" (
    "advisorProfileId" TEXT NOT NULL,
    "advisoryTypeId" TEXT NOT NULL,

    CONSTRAINT "advisor_specialties_pkey" PRIMARY KEY ("advisorProfileId","advisoryTypeId")
);

-- CreateTable
CREATE TABLE "advisory_requests" (
    "id" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "advisorProfileId" TEXT NOT NULL,
    "advisoryTypeId" TEXT NOT NULL,
    "problemDescription" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advisory_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "advisor_profiles_userId_key" ON "advisor_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "advisory_types_name_key" ON "advisory_types"("name");

-- AddForeignKey
ALTER TABLE "advisor_profiles" ADD CONSTRAINT "advisor_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advisor_specialties" ADD CONSTRAINT "advisor_specialties_advisorProfileId_fkey" FOREIGN KEY ("advisorProfileId") REFERENCES "advisor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advisor_specialties" ADD CONSTRAINT "advisor_specialties_advisoryTypeId_fkey" FOREIGN KEY ("advisoryTypeId") REFERENCES "advisory_types"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advisory_requests" ADD CONSTRAINT "advisory_requests_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advisory_requests" ADD CONSTRAINT "advisory_requests_advisorProfileId_fkey" FOREIGN KEY ("advisorProfileId") REFERENCES "advisor_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advisory_requests" ADD CONSTRAINT "advisory_requests_advisoryTypeId_fkey" FOREIGN KEY ("advisoryTypeId") REFERENCES "advisory_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
