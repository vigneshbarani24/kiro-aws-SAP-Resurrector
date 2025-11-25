-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "githubUsername" TEXT,
    "slackUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ABAPObject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "linesOfCode" INTEGER NOT NULL,
    "complexity" INTEGER,
    "documentation" TEXT,
    "businessLogic" JSONB,
    "dependencies" JSONB,
    "tables" JSONB,
    "embeddingId" TEXT,
    "resurrectionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ABAPObject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resurrection" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "githubRepo" TEXT,
    "githubUrl" TEXT,
    "githubMethod" TEXT,
    "basUrl" TEXT,
    "deploymentUrl" TEXT,
    "deploymentStatus" TEXT,
    "originalLOC" INTEGER,
    "transformedLOC" INTEGER,
    "locSaved" INTEGER,
    "complexityScore" DOUBLE PRECISION,
    "qualityScore" DOUBLE PRECISION,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resurrection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TransformationLog" (
    "id" TEXT NOT NULL,
    "resurrectionId" TEXT NOT NULL,
    "step" TEXT NOT NULL,
    "mcpServer" TEXT,
    "request" JSONB,
    "response" JSONB,
    "duration" INTEGER,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TransformationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityReport" (
    "id" TEXT NOT NULL,
    "resurrectionId" TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION NOT NULL,
    "syntaxValid" BOOLEAN NOT NULL,
    "cleanCoreCompliant" BOOLEAN NOT NULL,
    "businessLogicPreserved" BOOLEAN NOT NULL,
    "testCoverage" DOUBLE PRECISION,
    "issues" JSONB,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QualityReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HookExecution" (
    "id" TEXT NOT NULL,
    "resurrectionId" TEXT,
    "hookId" TEXT NOT NULL,
    "hookName" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "executionLog" JSONB,
    "duration" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HookExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SlackNotification" (
    "id" TEXT NOT NULL,
    "resurrectionId" TEXT,
    "channel" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "messageTs" TEXT,
    "threadTs" TEXT,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlackNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GitHubActivity" (
    "id" TEXT NOT NULL,
    "resurrectionId" TEXT,
    "activity" TEXT NOT NULL,
    "details" JSONB,
    "githubUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GitHubActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Redundancy" (
    "id" TEXT NOT NULL,
    "object1Id" TEXT NOT NULL,
    "object2Id" TEXT NOT NULL,
    "similarity" DOUBLE PRECISION NOT NULL,
    "recommendation" TEXT,
    "potentialSavings" INTEGER,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Redundancy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitToStandardRecommendation" (
    "id" TEXT NOT NULL,
    "abapObjectId" TEXT NOT NULL,
    "standardAlternative" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "implementationGuide" TEXT,
    "potentialSavings" INTEGER,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FitToStandardRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "ABAPObject_module_idx" ON "ABAPObject"("module");

-- CreateIndex
CREATE INDEX "ABAPObject_type_idx" ON "ABAPObject"("type");

-- CreateIndex
CREATE INDEX "Resurrection_status_idx" ON "Resurrection"("status");

-- CreateIndex
CREATE INDEX "Resurrection_userId_idx" ON "Resurrection"("userId");

-- CreateIndex
CREATE INDEX "Resurrection_module_idx" ON "Resurrection"("module");

-- CreateIndex
CREATE INDEX "TransformationLog_resurrectionId_idx" ON "TransformationLog"("resurrectionId");

-- CreateIndex
CREATE INDEX "QualityReport_resurrectionId_idx" ON "QualityReport"("resurrectionId");

-- CreateIndex
CREATE INDEX "HookExecution_resurrectionId_idx" ON "HookExecution"("resurrectionId");

-- CreateIndex
CREATE INDEX "HookExecution_hookId_idx" ON "HookExecution"("hookId");

-- CreateIndex
CREATE INDEX "SlackNotification_resurrectionId_idx" ON "SlackNotification"("resurrectionId");

-- CreateIndex
CREATE INDEX "GitHubActivity_resurrectionId_idx" ON "GitHubActivity"("resurrectionId");

-- CreateIndex
CREATE INDEX "Redundancy_object1Id_idx" ON "Redundancy"("object1Id");

-- CreateIndex
CREATE INDEX "Redundancy_object2Id_idx" ON "Redundancy"("object2Id");

-- CreateIndex
CREATE INDEX "FitToStandardRecommendation_abapObjectId_idx" ON "FitToStandardRecommendation"("abapObjectId");

-- AddForeignKey
ALTER TABLE "ABAPObject" ADD CONSTRAINT "ABAPObject_resurrectionId_fkey" FOREIGN KEY ("resurrectionId") REFERENCES "Resurrection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resurrection" ADD CONSTRAINT "Resurrection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TransformationLog" ADD CONSTRAINT "TransformationLog_resurrectionId_fkey" FOREIGN KEY ("resurrectionId") REFERENCES "Resurrection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityReport" ADD CONSTRAINT "QualityReport_resurrectionId_fkey" FOREIGN KEY ("resurrectionId") REFERENCES "Resurrection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HookExecution" ADD CONSTRAINT "HookExecution_resurrectionId_fkey" FOREIGN KEY ("resurrectionId") REFERENCES "Resurrection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SlackNotification" ADD CONSTRAINT "SlackNotification_resurrectionId_fkey" FOREIGN KEY ("resurrectionId") REFERENCES "Resurrection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitHubActivity" ADD CONSTRAINT "GitHubActivity_resurrectionId_fkey" FOREIGN KEY ("resurrectionId") REFERENCES "Resurrection"("id") ON DELETE SET NULL ON UPDATE CASCADE;
