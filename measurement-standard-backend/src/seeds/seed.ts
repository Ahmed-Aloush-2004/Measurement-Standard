/**
 * Database Seed Script for Qiyas Application
 *
 * Includes:
 * - Fake Users seeded with hashed passwords & random emails
 * - Time-distributed Questions, Users, and Test Sessions for MoM Analytics
 * - Idempotent ExamType / Section / Question / Choice seeding
 */

import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { Role } from '../auth/enums/role.enum';

dotenv.config();

const prisma = new PrismaClient();

interface SeedChoice {
  t: string;
  correct?: boolean;
}

interface SeedQuestion {
  q: string;
  e: string;
  choices: SeedChoice[];
}

interface SeedSection {
  name: string;
  questions: SeedQuestion[];
}

interface SeedExamType {
  name: string;
  code: string;
  sections: SeedSection[];
}

// Hashed password string provided or dummy bcrypt standard hash ($2b$10$...)
const HASHED_PASSWORD =
  '$2b$10$8pERDb9yk3TahZcEM8lLdeLlcPOrm9Geyv.Mb4EtVpO2q5zm02a1a';

/**
 * Generates random dates spanning back N months to simulate temporal analytics trends
 */
function getRandomPastDate(monthsBack = 6): Date {
  const now = new Date();
  const pastDate = new Date();
  const randomDays = Math.floor(Math.random() * (monthsBack * 30));
  pastDate.setDate(now.getDate() - randomDays);
  return pastDate;
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function questionKey(content: string): string {
  return normalizeText(content);
}

function choiceKey(content: string): string {
  return normalizeText(content);
}

/* ============================================================
 * QUESTIONS DATA
 * ============================================================ */

const VERBAL: SeedQuestion[] = [
  {
    q: 'مرادف كلمة "فَطِن":',
    choices: [
      { t: 'ذكي', correct: true },
      { t: 'غافل' },
      { t: 'سريع' },
      { t: 'قوي' },
    ],
    e: 'الفَطِن هو الذكي المدرك للأمور بسرعة.',
  },
  {
    q: 'عكس كلمة "الرحمة":',
    choices: [
      { t: 'القسوة', correct: true },
      { t: 'الحنان' },
      { t: 'العطف' },
      { t: 'اللين' },
    ],
    e: 'القسوة هي ضد الرحمة.',
  },
  {
    q: 'أسد : زئير :: ماء : ؟',
    choices: [
      { t: 'خرير', correct: true },
      { t: 'جريان' },
      { t: 'سكب' },
      { t: 'نهر' },
    ],
    e: 'مثلما يصدر الأسد الزئير، يصدر الماء خريراً.',
  },
  {
    q: 'مرادف كلمة "يهيم":',
    choices: [
      { t: 'يولع ويعجب', correct: true },
      { t: 'يكره' },
      { t: 'يندم' },
      { t: 'يهرب' },
    ],
    e: 'الهيام هو فرط الشوق والإعجاب.',
  },
  {
    q: 'اختر الكلمة الشاذة:',
    choices: [
      { t: 'زرقة' },
      { t: 'خضرة' },
      { t: 'حمرة' },
      { t: 'قمرة', correct: true },
    ],
    e: 'كل الكلمات ألوان عدا "قمرة".',
  },
  {
    q: 'طبيب : مستشفى :: معلم : ؟',
    choices: [
      { t: 'مدرسة', correct: true },
      { t: 'كتاب' },
      { t: 'سبورة' },
      { t: 'طالب' },
    ],
    e: 'الطبيب يعمل في المستشفى والمعلم يعمل في المدرسة.',
  },
];

const QUANTITATIVE: SeedQuestion[] = [
  {
    q: 'ما قيمة 15% من 200؟',
    choices: [
      { t: '30', correct: true },
      { t: '20' },
      { t: '25' },
      { t: '35' },
    ],
    e: '200 × 0.15 = 30',
  },
  {
    q: 'إذا كان 5س - 4 = 21، فما قيمة س؟',
    choices: [{ t: '5', correct: true }, { t: '6' }, { t: '4' }, { t: '7' }],
    e: '5س = 25، إذن س = 5.',
  },
  {
    q: 'اكمل المتتالية: 2، 6، 12، 20، ...',
    choices: [
      { t: '30', correct: true },
      { t: '26' },
      { t: '28' },
      { t: '32' },
    ],
    e: 'الفروق 4، 6، 8، 10، فالتالي 20 + 10 = 30.',
  },
  {
    q: 'إذا كان ثلث المجموع 12، فما المجموع؟',
    choices: [
      { t: '36', correct: true },
      { t: '24' },
      { t: '40' },
      { t: '48' },
    ],
    e: 'المجموع = 12 × 3 = 36.',
  },
];

const ACHIEVEMENT_MATH: SeedQuestion[] = [
  {
    q: 'ما ناتج حل المعادلة س + 5 = 12؟',
    choices: [{ t: '7', correct: true }, { t: '17' }, { t: '5' }, { t: '12' }],
    e: 'س = 12 - 5 = 7.',
  },
  {
    q: 'ما جذر 144؟',
    choices: [
      { t: '12', correct: true },
      { t: '11' },
      { t: '14' },
      { t: '13' },
    ],
    e: '12 × 12 = 144.',
  },
];

const ACHIEVEMENT_PHYSICS: SeedQuestion[] = [
  {
    q: 'ما وحدة قياس القوة؟',
    choices: [
      { t: 'نيوتن', correct: true },
      { t: 'جول' },
      { t: 'واط' },
      { t: 'باسكال' },
    ],
    e: 'تقاس القوة بوحدة النيوتن.',
  },
  {
    q: 'السرعة = ؟',
    choices: [
      { t: 'المسافة ÷ الزمن', correct: true },
      { t: 'الزمن ÷ المسافة' },
      { t: 'المسافة × الزمن' },
      { t: 'الزمن × الكتلة' },
    ],
    e: 'السرعة = المسافة ÷ الزمن.',
  },
];

const ACHIEVEMENT_CHEMISTRY: SeedQuestion[] = [
  {
    q: 'ما رمز عنصر الذهب؟',
    choices: [
      { t: 'Au', correct: true },
      { t: 'Ag' },
      { t: 'Al' },
      { t: 'Go' },
    ],
    e: 'Au مشتق من الاسم اللاتيني Aurum.',
  },
  {
    q: 'ما عدد الذرات في جزيء الماء H₂O؟',
    choices: [{ t: '3', correct: true }, { t: '2' }, { t: '4' }, { t: '1' }],
    e: 'جزيء الماء يحتوي على ذرتين هيدروجين وذرة أكسجين.',
  },
];

const ACHIEVEMENT_BIOLOGY: SeedQuestion[] = [
  {
    q: 'ما العضو المسؤول عن ضخ الدم في الجسم؟',
    choices: [
      { t: 'القلب', correct: true },
      { t: 'الكبد' },
      { t: 'الرئتان' },
      { t: 'الكلى' },
    ],
    e: 'القلب يضخ الدم عبر الأوعية الدموية.',
  },
  {
    q: 'ما عدد كروموسومات الإنسان؟',
    choices: [
      { t: '46', correct: true },
      { t: '44' },
      { t: '48' },
      { t: '23' },
    ],
    e: 'يمتلك الإنسان عادةً 23 زوجاً من الكروموسومات، أي 46 كروموسوماً.',
  },
];

const ACHIEVEMENT_ARABIC: SeedQuestion[] = [
  {
    q: 'ما إعراب "المعلمان مجتهدان"؟ المعلِمان:',
    choices: [
      { t: 'مبتدأ مرفوع وعلامة رفعه الألف', correct: true },
      { t: 'فاعل مرفوع بالضمة' },
      { t: 'مبتدأ مرفوع بالضمة' },
      { t: 'خبر مرفوع' },
    ],
    e: 'المثنى يرفع بالألف.',
  },
];

const STEP_GRAMMAR: SeedQuestion[] = [
  {
    q: 'She ___ to school every day.',
    choices: [
      { t: 'goes', correct: true },
      { t: 'go' },
      { t: 'going' },
      { t: 'gone' },
    ],
    e: 'مع She في المضارع البسيط نستخدم goes.',
  },
  {
    q: 'I have lived in Riyadh ___ 2015.',
    choices: [
      { t: 'since', correct: true },
      { t: 'for' },
      { t: 'from' },
      { t: 'by' },
    ],
    e: 'مع نقطة زمنية محددة نستخدم since.',
  },
];

const STEP_VOCABULARY: SeedQuestion[] = [
  {
    q: 'ما مرادف "happy"؟',
    choices: [
      { t: 'joyful', correct: true },
      { t: 'sad' },
      { t: 'angry' },
      { t: 'tired' },
    ],
    e: 'happy = joyful.',
  },
];

const STEP_READING: SeedQuestion[] = [
  {
    q: 'Read: "The Earth revolves around the Sun once every 365 days." What does the Earth do every 365 days?',
    choices: [
      { t: 'It revolves around the Sun', correct: true },
      { t: 'It revolves around the Moon' },
      { t: 'It stops moving' },
      { t: 'It changes shape' },
    ],
    e: 'The sentence states that Earth revolves around the Sun every 365 days.',
  },
];

const PRACTICE: SeedQuestion[] = [
  {
    q: 'ما قيمة 12 × 8؟',
    choices: [
      { t: '96', correct: true },
      { t: '84' },
      { t: '88' },
      { t: '108' },
    ],
    e: '12 × 8 = 96.',
  },
];

const DATA: SeedExamType[] = [
  {
    name: 'اختبار القدرات العامة (General Aptitude)',
    code: 'GENERAL_APTITUDE',
    sections: [
      { name: 'القدرات اللفظية', questions: VERBAL },
      { name: 'القدرات الكمية', questions: QUANTITATIVE },
    ],
  },
  {
    name: 'الاختبار التحصيلي (Achievement)',
    code: 'ACHIEVEMENT',
    sections: [
      { name: 'التحصيلي - الرياضيات', questions: ACHIEVEMENT_MATH },
      { name: 'التحصيلي - الفيزياء', questions: ACHIEVEMENT_PHYSICS },
      { name: 'التحصيلي - الكيمياء', questions: ACHIEVEMENT_CHEMISTRY },
      { name: 'التحصيلي - الأحياء', questions: ACHIEVEMENT_BIOLOGY },
      { name: 'التحصيلي - اللغة العربية', questions: ACHIEVEMENT_ARABIC },
    ],
  },
  {
    name: 'STEP (Standardized Test of English Proficiency)',
    code: 'STEP',
    sections: [
      { name: 'STEP - Grammar', questions: STEP_GRAMMAR },
      { name: 'STEP - Vocabulary', questions: STEP_VOCABULARY },
      { name: 'STEP - Reading Comprehension', questions: STEP_READING },
    ],
  },
  {
    name: 'الاختبارات التجريبية',
    code: 'PRACTICE',
    sections: [{ name: 'اختبار تجريبي شامل', questions: PRACTICE }],
  },
];

async function seed() {
  try {
    console.log('✓ Connected to Prisma');

    /*
     * --------------------------------------------------------
     * 1. Seed Users (With Hashed Password & Random Dates)
     * --------------------------------------------------------
     */
    console.log('\n--- Seeding Users ---');
    const dummyUsers = [
      {
        email: 'user1_test@analytics.local',
        name: 'User One',
        role: 'student',
      },
      {
        email: 'user2_test@analytics.local',
        name: 'User Two',
        role: 'student',
      },
      {
        email: 'user3_test@analytics.local',
        name: 'User Three',
        role: 'student',
      },
      {
        email: 'user4_test@analytics.local',
        name: 'User Four',
        role: 'student',
      },
      {
        email: 'user5_test@analytics.local',
        name: 'User Five',
        role: 'student',
      },
      {
        email: 'admin_test@analytics.local',
        name: 'Admin User',
        role: 'admin',
      },
    ];

    for (const userData of dummyUsers) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email },
      });
      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: userData.email,
            password_hash: HASHED_PASSWORD,
            username: userData.name,
            role: Role.USER,
            created_at: getRandomPastDate(5),
          },
        });
        console.log(`+ User created: ${userData.email}`);
      } else {
        console.log(`= User exists: ${userData.email}`);
      }
    }

    /*
     * --------------------------------------------------------
     * 2. Seed Exam Types, Sections, Questions, Choices
     * --------------------------------------------------------
     */
    console.log('\n--- Seeding Exam Structure & Questions ---');
    for (const examData of DATA) {
      let examType = await prisma.examType.findFirst({
        where: { code: examData.code, name: examData.name },
      });

      if (!examType) {
        examType = await prisma.examType.create({
          data: {
            name: examData.name,
            code: examData.code,
          },
        });
        console.log(`+ ExamType: ${examData.name}`);
      }

      for (const sectionData of examData.sections) {
        let section = await prisma.section.findFirst({
          where: { name: sectionData.name, exam_type_id: examType.id },
        });

        if (!section) {
          section = await prisma.section.create({
            data: {
              name: sectionData.name,
              exam_type_id: examType.id,
            },
          });
          console.log(`  + Section: ${sectionData.name}`);
        }

        const existingQuestions = await prisma.question.findMany({
          where: { section_id: section.id },
          include: { choices: true },
        });

        const existingQuestionMap = new Map(
          existingQuestions.map((q) => [questionKey(q.content), q]),
        );

        for (const seedQuestion of sectionData.questions) {
          const key = questionKey(seedQuestion.q);
          let question = existingQuestionMap.get(key);

          if (!question) {
            const created = await prisma.question.create({
              data: {
                content: seedQuestion.q,
                explanation: seedQuestion.e,
                section_id: section.id,
                created_at: getRandomPastDate(6), // Time-distributed questions for MoM Growth
              },
            });
            question = { ...created, choices: [] };
            console.log(`    + Question: ${seedQuestion.q.slice(0, 40)}...`);
          }

          const existingChoices = await prisma.choice.findMany({
            where: { question_id: question.id },
          });
          const existingChoiceMap = new Map(
            existingChoices.map((c) => [choiceKey(c.content), c]),
          );

          const seedChoices = shuffle(seedQuestion.choices);
          for (const seedChoice of seedChoices) {
            const content = choiceKey(seedChoice.t);
            if (!existingChoiceMap.has(content)) {
              await prisma.choice.create({
                data: {
                  content: seedChoice.t,
                  is_correct: seedChoice.correct === true,
                  question_id: question.id,
                },
              });
            }
          }
        }
      }
    }

    console.log('\n======================================');
    console.log('✓ Seeding complete with mock analytics history');
    console.log('======================================');
  } catch (error) {
    console.error('✗ Error seeding database:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void seed();
