/*
  Warnings:

  - You are about to drop the column `fielSize` on the `Apk` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[projectId]` on the table `Apk` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Verification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ApkStatus" ADD VALUE 'PENDING';
ALTER TYPE "ApkStatus" ADD VALUE 'READY';

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "scope" TEXT;

-- AlterTable
ALTER TABLE "Analysis" ADD COLUMN     "grade" TEXT,
ADD COLUMN     "scoreBreakdown" JSONB;

-- AlterTable
ALTER TABLE "Apk" DROP COLUMN "fielSize",
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "projectId" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ALTER COLUMN "fileName" DROP NOT NULL,
ALTER COLUMN "filePath" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Verification" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "testType" TEXT NOT NULL,
    "outcome" TEXT NOT NULL DEFAULT 'APK',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Project_userId_idx" ON "Project"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Apk_projectId_key" ON "Apk"("projectId");

-- AddForeignKey
ALTER TABLE "Apk" ADD CONSTRAINT "Apk_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
