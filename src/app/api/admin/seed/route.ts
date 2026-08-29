import { PrismaClient } from "@prisma/client";
import { AREAS, CLINICAL_MEDICINE } from "@/prisma/seed/taxonomy";
import { EXAM_BOARDS, EXAM_PROFILES, INSTITUTIONS, TAGS } from "@/prisma/seed/exam-profiles";
import { CARDIO_PNEUMO_QUESTIONS } from "@/prisma/seed/questions-cardio-pneumo";
import { NEURO_NEFRO_ENDO_QUESTIONS } from "@/prisma/seed/questions-neuro-nefro-endo";
import { INFECTO_HEMATO_ONCO_QUESTIONS } from "@/prisma/seed/questions-infecto-hemato-onco";
import { EMERGENCIA_GERIATRIA_QUESTIONS } from "@/prisma/seed/questions-emergencia-geriatria";
import { DISCURSIVE_QUESTIONS } from "@/prisma/seed/questions-discursivas";

const prisma = new PrismaClient();

const ALL_QUESTIONS = [
  ...CARDIO_PNEUMO_QUESTIONS,
  ...NEURO_NEFRO_ENDO_QUESTIONS,
  ...INFECTO_HEMATO_ONCO_QUESTIONS,
  ...EMERGENCIA_GERIATRIA_QUESTIONS,
  ...DISCURSIVE_QUESTIONS,
];

const DEFAULT_PROFILE_SLUG = "internato-clinica-medica";

export async function POST(request: Request) {
  // Security: Accept admin seed token if provided
  const authHeader = request.headers.get("authorization");
  const seedToken = process.env.SEED_TOKEN;

  if (seedToken && authHeader !== `Bearer ${seedToken}`) {
    return Response.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    console.log("→ Seeding database…");

    // Seed taxonomy
    console.log("→ Seeding taxonomy…");
    for (const area of AREAS) {
      await prisma.area.upsert({
        where: { slug: area.slug },
        update: { name: area.name, order: area.order, active: area.active },
        create: area,
      });
    }

    const clinica = await prisma.area.findUniqueOrThrow({
      where: { slug: "clinica-medica" },
    });

    for (const [i, spec] of CLINICAL_MEDICINE.entries()) {
      const specialty = await prisma.specialty.upsert({
        where: { slug: spec.slug },
        update: { name: spec.name, order: i, areaId: clinica.id },
        create: {
          slug: spec.slug,
          name: spec.name,
          order: i,
          areaId: clinica.id,
        },
      });

      for (const [j, topic] of spec.topics.entries()) {
        const t = await prisma.topic.upsert({
          where: { slug: topic.slug },
          update: {
            name: topic.name,
            yieldWeight: topic.yieldWeight,
            order: j,
            specialtyId: specialty.id,
          },
          create: {
            slug: topic.slug,
            name: topic.name,
            yieldWeight: topic.yieldWeight,
            order: j,
            specialtyId: specialty.id,
          },
        });

        for (const subtopic of topic.subtopics) {
          await prisma.subtopic.upsert({
            where: { slug: subtopic.slug },
            update: { name: subtopic.name, topicId: t.id },
            create: {
              slug: subtopic.slug,
              name: subtopic.name,
              topicId: t.id,
            },
          });
        }
      }
    }

    // Seed institutions, boards, and profiles
    console.log("→ Seeding exam profiles…");
    for (const inst of INSTITUTIONS) {
      await prisma.institution.upsert({
        where: { slug: inst.slug },
        update: inst,
        create: inst,
      });
    }

    for (const board of EXAM_BOARDS) {
      await prisma.examBoard.upsert({
        where: { slug: board.slug },
        update: board,
        create: board,
      });
    }

    for (const profile of EXAM_PROFILES) {
      await prisma.examProfile.upsert({
        where: { slug: profile.slug },
        update: profile,
        create: profile,
      });
    }

    // Seed tags
    console.log("→ Seeding tags…");
    for (const tag of TAGS) {
      await prisma.tag.upsert({
        where: { slug: tag.slug },
        update: tag,
        create: tag,
      });
    }

    // Seed questions
    console.log("→ Seeding questions…");
    const profile = await prisma.examProfile.findFirstOrThrow({
      where: { slug: DEFAULT_PROFILE_SLUG },
    });

    for (const q of ALL_QUESTIONS) {
      const specialty = await prisma.specialty.findFirstOrThrow({
        where: { slug: q.specialtySlug },
      });

      let topic = null;
      if (q.topicSlug) {
        topic = await prisma.topic.findFirst({
          where: { slug: q.topicSlug },
        });
      }

      let subtopic = null;
      if (q.subtopicSlug) {
        subtopic = await prisma.subtopic.findFirst({
          where: { slug: q.subtopicSlug },
        });
      }

      const question = await prisma.question.upsert({
        where: { code: q.code },
        update: {
          stem: q.stem,
          prompt: q.prompt,
          difficulty: q.difficulty,
          clinicalReasoningType: q.clinicalReasoningType,
          explanation: JSON.stringify(q.explanation),
          guidelineReference: JSON.stringify(q.guidelineReference || []),
          keywords: JSON.stringify(q.keywords || []),
          labData: q.labData ? JSON.stringify(q.labData) : null,
          media: q.media ? JSON.stringify(q.media) : null,
          rubric: q.rubric ? JSON.stringify(q.rubric) : null,
        },
        create: {
          code: q.code,
          stem: q.stem,
          prompt: q.prompt,
          type: q.type,
          status: "PUBLISHED",
          sourceType: "ORIGINAL",
          difficulty: q.difficulty,
          clinicalReasoningType: q.clinicalReasoningType,
          explanation: JSON.stringify(q.explanation),
          guidelineReference: JSON.stringify(q.guidelineReference || []),
          keywords: JSON.stringify(q.keywords || []),
          labData: q.labData ? JSON.stringify(q.labData) : null,
          media: q.media ? JSON.stringify(q.media) : null,
          rubric: q.rubric ? JSON.stringify(q.rubric) : null,
          specialtyId: specialty.id,
          topicId: topic?.id || null,
          subtopicId: subtopic?.id || null,
          examProfileId: profile.id,
        },
      });

      // Upsert alternatives
      for (const alt of q.alternatives) {
        await prisma.alternative.upsert({
          where: { questionId_label: { questionId: question.id, label: alt.label } },
          update: {
            text: alt.text,
            isCorrect: alt.isCorrect,
            rationale: alt.rationale,
            order: alt.order,
          },
          create: {
            questionId: question.id,
            label: alt.label,
            text: alt.text,
            isCorrect: alt.isCorrect,
            rationale: alt.rationale,
            order: alt.order,
          },
        });
      }

      // Upsert question stats
      await prisma.questionStat.upsert({
        where: { questionId: question.id },
        update: {},
        create: {
          questionId: question.id,
        },
      });
    }

    console.log("✓ Seeding complete!");
    return Response.json({
      success: true,
      message: "Database seeded successfully",
      stats: {
        areas: AREAS.length,
        specialties: CLINICAL_MEDICINE.length,
        questions: ALL_QUESTIONS.length,
        tags: TAGS.length,
        profiles: EXAM_PROFILES.length,
      },
    });
  } catch (error) {
    console.error("Seeding error:", error);
    return Response.json(
      {
        error: "Seeding failed",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
