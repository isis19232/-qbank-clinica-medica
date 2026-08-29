import { prisma } from "@/lib/db";
import type { Difficulty, ReasoningType } from "@/lib/domain/enums";
import { buildXray, countWords, isManagementType, type XrayInput } from "@/lib/engines/exam-xray";
import { parseJson } from "@/lib/domain/schemas";
import { guidelineRefSchema, labRowSchema, mediaSchema } from "@/lib/domain/schemas";
import { z } from "zod";

const labArray = z.array(labRowSchema);
const mediaArray = z.array(mediaSchema);
const guidelineArray = z.array(guidelineRefSchema);

/** Raio-X calculado sobre as questões efetivamente associadas ao perfil. */
export async function examXray(profileSlug: string) {
  const profile = await prisma.examProfile.findUnique({
    where: { slug: profileSlug },
    include: { institution: true, examBoard: true },
  });
  if (!profile) return null;

  const questions = await prisma.question.findMany({
    where: { examProfileId: profile.id, status: "PUBLISHED" },
    select: {
      id: true,
      stem: true,
      difficulty: true,
      clinicalReasoningType: true,
      labData: true,
      media: true,
      guidelineReference: true,
      specialty: { select: { slug: true, name: true } },
      topic: { select: { slug: true, name: true } },
    },
  });

  const items: XrayInput[] = questions.map((q) => {
    const media = parseJson(q.media, mediaArray, []);
    const labData = parseJson(q.labData, labArray, []);
    const reasoning = q.clinicalReasoningType as ReasoningType;

    return {
      id: q.id,
      specialtySlug: q.specialty.slug,
      specialtyName: q.specialty.name,
      topicSlug: q.topic?.slug ?? null,
      topicName: q.topic?.name ?? null,
      difficulty: q.difficulty as Difficulty,
      reasoningType: reasoning,
      stemWords: countWords(q.stem),
      hasLabData: labData.length > 0,
      hasEcg: media.some((m) => m.kind === "ECG"),
      hasImaging: media.some((m) => ["XRAY", "CT", "MRI", "US"].includes(m.kind)),
      hasCalculation: /escore|gap|fração|relação|critérios de light|fena|clearance|índice/i.test(q.stem),
      isManagement: isManagementType(reasoning),
      guidelineSocieties: parseJson(q.guidelineReference, guidelineArray, []).map((g) => g.society),
    };
  });

  return {
    profile: {
      slug: profile.slug,
      name: profile.name,
      description: profile.description,
      institution: profile.institution?.name ?? null,
      examBoard: profile.examBoard?.name ?? null,
      year: profile.year,
      statsSource: profile.statsSource,
      declared: {
        alternativesCount: profile.alternativesCount,
        avgStemWords: profile.avgStemWords,
        objectiveCount: profile.objectiveCount,
        discursiveCount: profile.discursiveCount,
        durationMinutes: profile.durationMinutes,
        labDataFrequency: profile.labDataFrequency,
        ecgFrequency: profile.ecgFrequency,
        imagingFrequency: profile.imagingFrequency,
        calculationFrequency: profile.calculationFrequency,
        managementFrequency: profile.managementFrequency,
        clinicalReasoningIntensity: profile.clinicalReasoningIntensity,
        difficultyDistribution: {
          EASY: profile.easyShare,
          MEDIUM: profile.mediumShare,
          HARD: profile.hardShare,
          VERY_HARD: profile.veryHardShare,
        },
        sampleSize: profile.sampleSize,
      },
      distractorPatterns: parseJson(profile.distractorPatterns, z.array(z.string()), []),
      preferredTerminology: parseJson(profile.preferredTerminology, z.array(z.string()), []),
      recurringThemes: parseJson(profile.recurringThemes, z.array(z.string()), []),
    },
    /** Estatísticas medidas sobre o banco atual — distintas das declaradas no perfil. */
    measured: buildXray(items),
  };
}

export async function listExamProfiles() {
  const profiles = await prisma.examProfile.findMany({
    orderBy: { name: "asc" },
    include: {
      institution: { select: { name: true } },
      _count: { select: { questions: true } },
    },
  });
  return profiles.map((p) => ({
    slug: p.slug,
    name: p.name,
    description: p.description,
    institution: p.institution?.name ?? null,
    year: p.year,
    questionCount: p._count.questions,
    statsSource: p.statsSource,
  }));
}
