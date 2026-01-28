-- CreateEnum
CREATE TYPE "ApkStatus" AS ENUM ('UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED', 'DELETED');

-- CreateTable
CREATE TABLE "Apk" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fielSize" INTEGER NOT NULL,
    "filePath" TEXT NOT NULL,
    "packageName" TEXT,
    "versionName" TEXT,
    "versionCode" INTEGER,
    "minSdkVersion" INTEGER,
    "targetSdkVersion" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ApkStatus" NOT NULL DEFAULT 'UPLOADED',

    CONSTRAINT "Apk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Analysis" (
    "id" TEXT NOT NULL,
    "apkId" TEXT NOT NULL,
    "vulnerabilities" JSONB,
    "permissions" JSONB,
    "securityScore" DOUBLE PRECISION,
    "decompiled" BOOLEAN NOT NULL DEFAULT false,
    "decompiledPath" TEXT,
    "manifestData" JSONB,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "errorMessage" TEXT,

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Apk_userId_idx" ON "Apk"("userId");

-- CreateIndex
CREATE INDEX "Apk_status_idx" ON "Apk"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Analysis_apkId_key" ON "Analysis"("apkId");

-- AddForeignKey
ALTER TABLE "Apk" ADD CONSTRAINT "Apk_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_apkId_fkey" FOREIGN KEY ("apkId") REFERENCES "Apk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
