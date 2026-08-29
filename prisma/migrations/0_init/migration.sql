-- CreateTable "Area"
CREATE TABLE "Area" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable "Specialty"
CREATE TABLE "Specialty" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "areaId" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Specialty_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area" ("id") ON DELETE CASCADE
);

-- CreateTable "Topic"
CREATE TABLE "Topic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "specialtyId" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "yieldWeight" INTEGER NOT NULL DEFAULT 3,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Topic_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty" ("id") ON DELETE CASCADE
);

-- CreateTable "Subtopic"
CREATE TABLE "Subtopic" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "topicId" TEXT NOT NULL,
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    CONSTRAINT "Subtopic_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE CASCADE
);

-- CreateTable "Tag"
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'THEME'
);

-- CreateTable "QuestionTag"
CREATE TABLE "QuestionTag" (
    "questionId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,
    PRIMARY KEY ("questionId", "tagId"),
    CONSTRAINT "QuestionTag_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE,
    CONSTRAINT "QuestionTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag" ("id") ON DELETE CASCADE
);

-- CreateTable "Institution"
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "state" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'UNIVERSITY'
);

-- CreateTable "ExamBoard"
CREATE TABLE "ExamBoard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL
);

-- CreateTable "ExamProfile"
CREATE TABLE "ExamProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "institutionId" TEXT,
    "examBoardId" TEXT,
    "year" INTEGER,
    "description" TEXT,
    "alternativesCount" INTEGER NOT NULL DEFAULT 4,
    "avgStemWords" INTEGER NOT NULL DEFAULT 180,
    "objectiveCount" INTEGER NOT NULL DEFAULT 20,
    "discursiveCount" INTEGER NOT NULL DEFAULT 0,
    "durationMinutes" INTEGER NOT NULL DEFAULT 120,
    "labDataFrequency" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "ecgFrequency" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "imagingFrequency" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "calculationFrequency" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "managementFrequency" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "clinicalReasoningIntensity" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "easyShare" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "mediumShare" DOUBLE PRECISION NOT NULL DEFAULT 0.4,
    "hardShare" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "veryHardShare" DOUBLE PRECISION NOT NULL DEFAULT 0.15,
    "specialtyMix" TEXT NOT NULL DEFAULT '{}',
    "distractorPatterns" TEXT NOT NULL DEFAULT '[]',
    "preferredTerminology" TEXT NOT NULL DEFAULT '[]',
    "recurringThemes" TEXT NOT NULL DEFAULT '[]',
    "statsSource" TEXT NOT NULL DEFAULT 'MANUAL',
    "sampleSize" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ExamProfile_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution" ("id") ON DELETE SET NULL,
    CONSTRAINT "ExamProfile_examBoardId_fkey" FOREIGN KEY ("examBoardId") REFERENCES "ExamBoard" ("id") ON DELETE SET NULL
);

-- CreateTable "User"
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL UNIQUE,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "targetExamId" TEXT,
    "dailyGoal" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "User_targetExamId_fkey" FOREIGN KEY ("targetExamId") REFERENCES "ExamProfile" ("id") ON DELETE SET NULL
);

-- CreateTable "Session"
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL UNIQUE,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- CreateTable "Question"
CREATE TABLE "Question" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL UNIQUE,
    "type" TEXT NOT NULL DEFAULT 'OBJECTIVE',
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "sourceType" TEXT NOT NULL DEFAULT 'ORIGINAL',
    "stem" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL,
    "clinicalReasoningType" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,
    "topicId" TEXT,
    "subtopicId" TEXT,
    "examProfileId" TEXT,
    "examYear" INTEGER,
    "labData" TEXT,
    "media" TEXT,
    "guidelineReference" TEXT NOT NULL DEFAULT '[]',
    "keywords" TEXT NOT NULL DEFAULT '[]',
    "explanation" TEXT NOT NULL,
    "rubric" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Question_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "Specialty" ("id"),
    CONSTRAINT "Question_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "Topic" ("id") ON DELETE SET NULL,
    CONSTRAINT "Question_subtopicId_fkey" FOREIGN KEY ("subtopicId") REFERENCES "Subtopic" ("id") ON DELETE SET NULL,
    CONSTRAINT "Question_examProfileId_fkey" FOREIGN KEY ("examProfileId") REFERENCES "ExamProfile" ("id") ON DELETE SET NULL
);

-- CreateTable "Alternative"
CREATE TABLE "Alternative" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questionId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "rationale" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "Alternative_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE
);

-- CreateTable "QuestionStat"
CREATE TABLE "QuestionStat" (
    "questionId" TEXT NOT NULL PRIMARY KEY,
    "timesAnswered" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "incorrectCount" INTEGER NOT NULL DEFAULT 0,
    "blankCount" INTEGER NOT NULL DEFAULT 0,
    "totalTimeMs" INTEGER NOT NULL DEFAULT 0,
    "answerHistogram" TEXT NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "QuestionStat_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE
);

-- CreateTable "Attempt"
CREATE TABLE "Attempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedLabel" TEXT,
    "discursiveText" TEXT,
    "isCorrect" BOOLEAN,
    "confidence" TEXT NOT NULL DEFAULT 'UNSURE',
    "responseTimeMs" INTEGER NOT NULL DEFAULT 0,
    "changedAnswer" BOOLEAN NOT NULL DEFAULT false,
    "mode" TEXT NOT NULL DEFAULT 'PRACTICE',
    "studySessionId" TEXT,
    "examAttemptId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Attempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    CONSTRAINT "Attempt_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE,
    CONSTRAINT "Attempt_studySessionId_fkey" FOREIGN KEY ("studySessionId") REFERENCES "StudySession" ("id") ON DELETE SET NULL,
    CONSTRAINT "Attempt_examAttemptId_fkey" FOREIGN KEY ("examAttemptId") REFERENCES "ExamAttempt" ("id") ON DELETE CASCADE
);

-- CreateTable "UserQuestionStat"
CREATE TABLE "UserQuestionStat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "timesAnswered" INTEGER NOT NULL DEFAULT 0,
    "correctCount" INTEGER NOT NULL DEFAULT 0,
    "incorrectCount" INTEGER NOT NULL DEFAULT 0,
    "personalAccuracy" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalTimeMs" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTimeMs" INTEGER NOT NULL DEFAULT 0,
    "lastAnsweredAt" TIMESTAMP(3),
    "lastConfidence" TEXT,
    "lastCorrect" BOOLEAN,
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "intervalDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" TIMESTAMP(3),
    "suspended" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "UserQuestionStat_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    CONSTRAINT "UserQuestionStat_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE
);

-- CreateTable "ErrorNotebookEntry"
CREATE TABLE "ErrorNotebookEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "selectedLabel" TEXT,
    "correctLabel" TEXT NOT NULL,
    "errorType" TEXT NOT NULL,
    "classifiedBy" TEXT NOT NULL DEFAULT 'AUTO',
    "note" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "occurrences" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ErrorNotebookEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    CONSTRAINT "ErrorNotebookEntry_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE
);

-- CreateTable "Favorite"
CREATE TABLE "Favorite" (
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("userId", "questionId"),
    CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    CONSTRAINT "Favorite_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE
);

-- CreateTable "Flashcard"
CREATE TABLE "Flashcard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "questionId" TEXT,
    "front" TEXT NOT NULL,
    "back" TEXT NOT NULL,
    "topicLabel" TEXT,
    "difficulty" TEXT NOT NULL DEFAULT 'MEDIUM',
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "easeFactor" DOUBLE PRECISION NOT NULL DEFAULT 2.5,
    "intervalDays" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "repetitions" INTEGER NOT NULL DEFAULT 0,
    "nextReviewAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Flashcard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    CONSTRAINT "Flashcard_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE SET NULL
);

-- CreateTable "StudySession"
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "plannedMinutes" INTEGER,
    "plannedCount" INTEGER NOT NULL DEFAULT 0,
    "composition" TEXT NOT NULL DEFAULT '{}',
    "questionOrder" TEXT NOT NULL DEFAULT '[]',
    "filters" TEXT NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE
);

-- CreateTable "Exam"
CREATE TABLE "Exam" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL UNIQUE,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "examProfileId" TEXT,
    "questionCount" INTEGER NOT NULL,
    "timeLimitMin" INTEGER NOT NULL,
    "blueprint" TEXT NOT NULL DEFAULT '{}',
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Exam_examProfileId_fkey" FOREIGN KEY ("examProfileId") REFERENCES "ExamProfile" ("id") ON DELETE SET NULL
);

-- CreateTable "ExamItem"
CREATE TABLE "ExamItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "ExamItem_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE,
    CONSTRAINT "ExamItem_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question" ("id") ON DELETE CASCADE
);

-- CreateTable "ExamAttempt"
CREATE TABLE "ExamAttempt" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "examId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "scoreRaw" INTEGER NOT NULL DEFAULT 0,
    "scorePct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "blankCount" INTEGER NOT NULL DEFAULT 0,
    "changedCount" INTEGER NOT NULL DEFAULT 0,
    "totalTimeMs" INTEGER NOT NULL DEFAULT 0,
    "report" TEXT NOT NULL DEFAULT '{}',
    CONSTRAINT "ExamAttempt_examId_fkey" FOREIGN KEY ("examId") REFERENCES "Exam" ("id") ON DELETE CASCADE
);

-- CreateTable "GenerationJob"
CREATE TABLE "GenerationJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "examProfileId" TEXT,
    "params" TEXT NOT NULL DEFAULT '{}',
    "result" TEXT,
    "error" TEXT,
    "provider" TEXT,
    "model" TEXT,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    CONSTRAINT "GenerationJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE,
    CONSTRAINT "GenerationJob_examProfileId_fkey" FOREIGN KEY ("examProfileId") REFERENCES "ExamProfile" ("id") ON DELETE SET NULL
);

-- CreateIndex
CREATE INDEX "Specialty_areaId_idx" ON "Specialty"("areaId");

-- CreateIndex
CREATE INDEX "Topic_specialtyId_idx" ON "Topic"("specialtyId");

-- CreateIndex
CREATE INDEX "Subtopic_topicId_idx" ON "Subtopic"("topicId");

-- CreateIndex
CREATE INDEX "QuestionTag_tagId_idx" ON "QuestionTag"("tagId");

-- CreateIndex
CREATE INDEX "ExamProfile_institutionId_idx" ON "ExamProfile"("institutionId");

-- CreateIndex
CREATE INDEX "ExamProfile_examBoardId_idx" ON "ExamProfile"("examBoardId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_targetExamId_idx" ON "User"("targetExamId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_tokenHash_key" ON "Session"("tokenHash");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Question_code_key" ON "Question"("code");

-- CreateIndex
CREATE INDEX "Question_specialtyId_idx" ON "Question"("specialtyId");

-- CreateIndex
CREATE INDEX "Question_topicId_idx" ON "Question"("topicId");

-- CreateIndex
CREATE INDEX "Question_difficulty_idx" ON "Question"("difficulty");

-- CreateIndex
CREATE INDEX "Question_examProfileId_idx" ON "Question"("examProfileId");

-- CreateIndex
CREATE INDEX "Question_status_idx" ON "Question"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Alternative_questionId_label_key" ON "Alternative"("questionId", "label");

-- CreateIndex
CREATE INDEX "Alternative_questionId_idx" ON "Alternative"("questionId");

-- CreateIndex
CREATE INDEX "Attempt_userId_createdAt_idx" ON "Attempt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Attempt_userId_questionId_idx" ON "Attempt"("userId", "questionId");

-- CreateIndex
CREATE INDEX "Attempt_questionId_idx" ON "Attempt"("questionId");

-- CreateIndex
CREATE INDEX "Attempt_examAttemptId_idx" ON "Attempt"("examAttemptId");

-- CreateIndex
CREATE UNIQUE INDEX "UserQuestionStat_userId_questionId_key" ON "UserQuestionStat"("userId", "questionId");

-- CreateIndex
CREATE INDEX "UserQuestionStat_userId_nextReviewAt_idx" ON "UserQuestionStat"("userId", "nextReviewAt");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorNotebookEntry_userId_questionId_key" ON "ErrorNotebookEntry"("userId", "questionId");

-- CreateIndex
CREATE INDEX "ErrorNotebookEntry_userId_resolved_idx" ON "ErrorNotebookEntry"("userId", "resolved");

-- CreateIndex
CREATE INDEX "Favorite_questionId_idx" ON "Favorite"("questionId");

-- CreateIndex
CREATE INDEX "Flashcard_userId_nextReviewAt_idx" ON "Flashcard"("userId", "nextReviewAt");

-- CreateIndex
CREATE INDEX "StudySession_userId_startedAt_idx" ON "StudySession"("userId", "startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Exam_slug_key" ON "Exam"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ExamItem_examId_questionId_key" ON "ExamItem"("examId", "questionId");

-- CreateIndex
CREATE INDEX "ExamItem_examId_idx" ON "ExamItem"("examId");

-- CreateIndex
CREATE INDEX "ExamAttempt_userId_startedAt_idx" ON "ExamAttempt"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "ExamAttempt_examId_idx" ON "ExamAttempt"("examId");

-- CreateIndex
CREATE INDEX "GenerationJob_userId_createdAt_idx" ON "GenerationJob"("userId", "createdAt");
