import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth/password";
import { questionInputSchema, type QuestionInput } from "../src/lib/domain/schemas";
import { AREAS, CLINICAL_MEDICINE } from "./seed/taxonomy";
import { EXAM_BOARDS, EXAM_PROFILES, INSTITUTIONS, TAGS } from "./seed/exam-profiles";
import { CARDIO_PNEUMO_QUESTIONS } from "./seed/questions-cardio-pneumo";
import { NEURO_NEFRO_ENDO_QUESTIONS } from "./seed/questions-neuro-nefro-endo";
import { INFECTO_HEMATO_ONCO_QUESTIONS } from "./seed/questions-infecto-hemato-onco";
import { EMERGENCIA_GERIATRIA_QUESTIONS } from "./seed/questions-emergencia-geriatria";
import { DISCURSIVE_QUESTIONS } from "./seed/questions-discursivas";

const prisma = new PrismaClient();

const ALL_QUESTIONS: QuestionInput[] = [
  ...CARDIO_PNEUMO_QUESTIONS,
  ...NEURO_NEFRO_ENDO_QUESTIONS,
  ...INFECTO_HEMATO_ONCO_QUESTIONS,
  ...EMERGENCIA_GERIATRIA_QUESTIONS,
  ...DISCURSIVE_QUESTIONS,
];

/** Todas as questões do seed pertencem ao perfil de referência. */
const DEFAULT_PROFILE_SLUG = "internato-clinica-medica";

async function main() {
  console.log("→ Semeando taxonomia…");
  for (const area of AREAS) {
    await prisma.area.upsert({
      where: { slug: area.slug },
      update: { name: area.name, order: area.order, active: area.active },
      create: area,
    });
  }

  const clinica = await prisma.area.findUniqueOrThrow({ where: { slug: "clinica-medica" } });

  for (const [i, spec] of CLINICAL_MEDICINE.entries()) {
    const specialty = await prisma.specialty.upsert({
      where: { slug: spec.slug },
      update: { name: spec.name, order: i, areaId: clinica.id },
      create: { slug: spec.slug, name: spec.name, order: i, areaId: clinica.id },
    });

    for (const [j, topic] of spec.topics.entries()) {
      const t = await prisma.topic.upsert({
        where: { slug: topic.slug },
        update: { name: topic.name, yieldWeight: topic.yieldWeight, order: j, specialtyId: specialty.id },
        create: {
          slug: topic.slug,
          name: topic.name,
          yieldWeight: topic.yieldWeight,
          order: j,
          specialtyId: specialty.id,
        },
      });

      for (const sub of topic.subtopics ?? []) {
        await prisma.subtopic.upsert({
          where: { slug: sub.slug },
          update: { name: sub.name, topicId: t.id },
          create: { slug: sub.slug, name: sub.name, topicId: t.id },
        });
      }
    }
  }

  console.log("→ Semeando instituições, bancas e tags…");
  for (const inst of INSTITUTIONS) {
    await prisma.institution.upsert({
      where: { slug: inst.slug },
      update: { name: inst.name, kind: inst.kind, state: inst.state },
      create: { slug: inst.slug, name: inst.name, kind: inst.kind, state: inst.state },
    });
  }
  for (const board of EXAM_BOARDS) {
    await prisma.examBoard.upsert({ where: { slug: board.slug }, update: board, create: board });
  }
  for (const tag of TAGS) {
    await prisma.tag.upsert({ where: { slug: tag.slug }, update: tag, create: tag });
  }

  console.log("→ Semeando perfis de prova…");
  for (const p of EXAM_PROFILES) {
    const institution = p.institutionSlug
      ? await prisma.institution.findUnique({ where: { slug: p.institutionSlug } })
      : null;
    const board = p.examBoardSlug
      ? await prisma.examBoard.findUnique({ where: { slug: p.examBoardSlug } })
      : null;

    const data = {
      name: p.name,
      description: p.description,
      institutionId: institution?.id ?? null,
      examBoardId: board?.id ?? null,
      year: p.year ?? null,
      alternativesCount: p.alternativesCount,
      avgStemWords: p.avgStemWords,
      objectiveCount: p.objectiveCount,
      discursiveCount: p.discursiveCount,
      durationMinutes: p.durationMinutes,
      labDataFrequency: p.labDataFrequency,
      ecgFrequency: p.ecgFrequency,
      imagingFrequency: p.imagingFrequency,
      calculationFrequency: p.calculationFrequency,
      managementFrequency: p.managementFrequency,
      clinicalReasoningIntensity: p.clinicalReasoningIntensity,
      easyShare: p.easyShare,
      mediumShare: p.mediumShare,
      hardShare: p.hardShare,
      veryHardShare: p.veryHardShare,
      specialtyMix: JSON.stringify(p.specialtyMix),
      distractorPatterns: JSON.stringify(p.distractorPatterns),
      preferredTerminology: JSON.stringify(p.preferredTerminology),
      recurringThemes: JSON.stringify(p.recurringThemes),
      statsSource: p.statsSource,
      sampleSize: p.sampleSize,
    };

    await prisma.examProfile.upsert({
      where: { slug: p.slug },
      update: data,
      create: { slug: p.slug, ...data },
    });
  }

  console.log(`→ Semeando ${ALL_QUESTIONS.length} questões originais…`);
  const profile = await prisma.examProfile.findUniqueOrThrow({ where: { slug: DEFAULT_PROFILE_SLUG } });

  let created = 0;
  for (const raw of ALL_QUESTIONS) {
    const parsed = questionInputSchema.safeParse(raw);
    if (!parsed.success) {
      console.error(`  ✗ ${raw.code}: ${parsed.error.issues.map((i) => i.message).join("; ")}`);
      continue;
    }
    const q = parsed.data;

    const specialty = await prisma.specialty.findUnique({ where: { slug: q.specialtySlug } });
    if (!specialty) {
      console.error(`  ✗ ${q.code}: especialidade "${q.specialtySlug}" não encontrada.`);
      continue;
    }
    const topic = q.topicSlug ? await prisma.topic.findUnique({ where: { slug: q.topicSlug } }) : null;
    const subtopic = q.subtopicSlug
      ? await prisma.subtopic.findUnique({ where: { slug: q.subtopicSlug } })
      : null;

    const data = {
      type: q.type,
      status: q.status,
      sourceType: q.sourceType,
      stem: q.stem,
      prompt: q.prompt,
      difficulty: q.difficulty,
      clinicalReasoningType: q.clinicalReasoningType,
      specialtyId: specialty.id,
      topicId: topic?.id ?? null,
      subtopicId: subtopic?.id ?? null,
      examProfileId: profile.id,
      examYear: q.examYear ?? null,
      labData: q.labData.length ? JSON.stringify(q.labData) : null,
      media: q.media.length ? JSON.stringify(q.media) : null,
      guidelineReference: JSON.stringify(q.guidelineReference),
      keywords: JSON.stringify(q.keywords),
      explanation: JSON.stringify(q.explanation),
      rubric: q.rubric ? JSON.stringify(q.rubric) : null,
    };

    const question = await prisma.question.upsert({
      where: { code: q.code },
      update: data,
      create: { code: q.code, ...data },
    });

    // Alternativas e tags são reescritas por completo — o seed é idempotente.
    await prisma.alternative.deleteMany({ where: { questionId: question.id } });
    for (const [i, alt] of q.alternatives.entries()) {
      await prisma.alternative.create({
        data: {
          questionId: question.id,
          label: alt.label,
          text: alt.text,
          isCorrect: alt.isCorrect,
          rationale: alt.rationale,
          order: i,
        },
      });
    }

    await prisma.questionTag.deleteMany({ where: { questionId: question.id } });
    for (const slug of q.tags) {
      const tag = await prisma.tag.findUnique({ where: { slug } });
      if (tag) {
        await prisma.questionTag.create({ data: { questionId: question.id, tagId: tag.id } });
      }
    }

    await prisma.questionStat.upsert({
      where: { questionId: question.id },
      update: {},
      create: { questionId: question.id },
    });

    created += 1;
  }
  console.log(`  ✓ ${created} questões gravadas.`);

  console.log("→ Criando usuário de demonstração…");
  await prisma.user.upsert({
    where: { email: "demo@qbank.local" },
    update: { targetExamId: profile.id },
    create: {
      email: "demo@qbank.local",
      name: "Estudante Demo",
      passwordHash: await hashPassword("demo1234"),
      role: "STUDENT",
      targetExamId: profile.id,
      dailyGoal: 20,
    },
  });

  console.log("\n✓ Seed concluído.");
  console.log("  Login de demonstração: demo@qbank.local / demo1234");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
