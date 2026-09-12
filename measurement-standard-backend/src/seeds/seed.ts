/**
 * سكريبت زرع بيانات تجريبية لقاعدة بيانات "معيار قياس"
 *
 * التشغيل:
 *   npm run seed
 *
 * آمن للتكرار (idempotent): يتحقق من وجود كل نوع اختبار/قسم
 * قبل إنشائه، ولا يضيف سؤالاً مكرراً بنفس النص.
 */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { UserProgress } from '../user-progress/entities/user-progress.entity';
import { ExamType } from '../exam-types/entities/exam-type.entity';
import { Section } from '../sections/entities/section.entity';
import { Question } from '../questions/entities/question.entity';
import { Choice } from '../choices/entities/choice.entity';
import { UserResponse } from '../user-responses/entities/user-response.entity';
import { TestSession } from '../test-sessions/entities/test-session.entity';
import { Favorite } from '../favorites/entities/favorite.entity';
import { Notification } from '../notifications/entities/notification.entity';

dotenv.config();

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'qiyas_db',
  entities: [
    User,
    UserProgress,
    ExamType,
    Section,
    Question,
    Choice,
    UserResponse,
    TestSession,
    Favorite,
    Notification,
  ],
  synchronize: false,
  logging: false,
});

interface SeedChoice {
  t: string;
  correct?: boolean;
}

interface SeedQuestion {
  q: string;
  e?: string;
  choices: SeedChoice[];
}

interface SeedSection {
  name: string;
  questions: SeedQuestion[];
}

interface SeedExamType {
  name: string;
  sections: SeedSection[];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function seedKey(content: string, choices: { t?: string; content?: string }[]): string {
  const choiceText = choices.map((c) => c.t ?? c.content ?? '').sort().join('|');
  return `${content}::${choiceText}`;
}

// ============================================================
// بيانات الاختبارات
// ============================================================
const VERBAL: SeedQuestion[] = [
  { q: 'مرادف كلمة "فَطِن":', choices: [{ t: 'ذكي', correct: true }, { t: 'غافل' }, { t: 'سريع' }, { t: 'قوي' }], e: 'الفَطِن هو الذكي المدرك للأمور بسرعة.' },
  { q: 'عكس كلمة "الرحمة":', choices: [{ t: 'القسوة', correct: true }, { t: 'الحنان' }, { t: 'العطف' }, { t: 'اللين' }], e: 'القسوة هي ضد الرحمة.' },
  { q: 'أسد : زئير :: ماء : ؟', choices: [{ t: 'خرير', correct: true }, { t: 'جريان' }, { t: 'سكب' }, { t: 'نهر' }], e: 'مثلما يصدر الأسد الزئير، يصدر الماء خريراً.' },
  { q: 'مرادف كلمة "يهيم":', choices: [{ t: 'يولع ويعجب', correct: true }, { t: 'يكره' }, { t: 'يندم' }, { t: 'يهرب' }], e: 'الهيام هو فرط الشوق والإعجاب.' },
  { q: 'اختر الكلمة الشاذة:', choices: [{ t: 'زرقة' }, { t: 'خضرة' }, { t: 'حمرة' }, { t: 'قمرة', correct: true }], e: 'كل الكلمات ألوان عدا "قمرة".' },
  { q: 'طبيب : مستشفى :: معلم : ؟', choices: [{ t: 'مدرسة', correct: true }, { t: 'كتاب' }, { t: 'سبورة' }, { t: 'طالب' }], e: 'الطبيب يعمل في المستشفى والمعلم يعمل في المدرسة.' },
  { q: 'عكس كلمة "الازدهار":', choices: [{ t: 'الانحدار', correct: true }, { t: 'النجاح' }, { t: 'التقدم' }, { t: 'الرخاء' }], e: 'الانحدار هو ضد الازدهار والرقّي.' },
  { q: 'أكمل: "العلم في الصغر كالنقش في ...":', choices: [{ t: 'الحجر', correct: true }, { t: 'الرمل' }, { t: 'الماء' }, { t: 'الورق' }], e: 'مثل سائر: العلم في الصغر كالنقش على الحجر.' },
  { q: 'مرادف كلمة "الخلاصة":', choices: [{ t: 'الموجز', correct: true }, { t: 'التفصيل' }, { t: 'المقدمة' }, { t: 'الخاتمة' }], e: 'الخلاصة هي الملخص والموجز لأهم ما قيل.' },
  { q: 'غرفة : بيت :: عصفور : ؟', choices: [{ t: 'عُش', correct: true }, { t: 'شجرة' }, { t: 'سماء' }, { t: 'جناح' }], e: 'الغرفة جزء من البيت، والعش مسكن العصفور.' },
  { q: 'عكس كلمة "التقدّم":', choices: [{ t: 'التأخر', correct: true }, { t: 'السرعة' }, { t: 'النهضة' }, { t: 'السبق' }], e: 'التأخر هو ضد التقدم.' },
  { q: 'أكمل: "اجتهد حتى .... هدفك":', choices: [{ t: 'تحقق' }, { t: 'تحققت', correct: true }, { t: 'تحققان' }, { t: 'تحققوا' }], e: 'الصيغة الصحيحة: اجتهد حتى تحققت هدفك.' },
  { q: 'مرادف كلمة "يجود":', choices: [{ t: 'يبرع', correct: true }, { t: 'يخسر' }, { t: 'يبخل' }, { t: 'يتردد' }], e: 'الجود هو الإتقان والتفوق.' },
  { q: 'قلم : كتابة :: سكين : ؟', choices: [{ t: 'قطع', correct: true }, { t: 'شوكة' }, { t: 'وجبة' }, { t: 'مطبخ' }], e: 'القلم أداة للكتابة والسكين أداة للقطع.' },
  { q: 'عكس كلمة "الجور":', choices: [{ t: 'العدل', correct: true }, { t: 'الظلم' }, { t: 'القسوة' }, { t: 'الطغيان' }], e: 'الجور هو الظلم وضده العدل.' },
  { q: 'حدد الكلمة المختلفة:', choices: [{ t: 'بحر' }, { t: 'محيط' }, { t: 'بحيرة' }, { t: 'نبع', correct: true }], e: 'النبع مصدر مياه صغير وليس مسطحاً مائياً مثل الباقي.' },
  { q: 'مرادف كلمة "التراث":', choices: [{ t: 'الموروث', correct: true }, { t: 'البدعة' }, { t: 'الحديث' }, { t: 'الاختراع' }], e: 'التراث هو ما يورث من عادات وعلوم وآداب.' },
  { q: 'أكمل: "الصبر مفتاح ...":', choices: [{ t: 'الفرج', correct: true }, { t: 'المشكلة' }, { t: 'الباب' }, { t: 'القفل' }], e: 'مثل سائر: الصبر مفتاح الفرج.' },
  { q: 'جوع : طعام :: عطش : ؟', choices: [{ t: 'ماء', correct: true }, { t: 'صحراء' }, { t: 'ظل' }, { t: 'حرّ' }], e: 'كما يزيل الطعام الجوع، يزيل الماء العطش.' },
  { q: 'عكس كلمة "السكينة":', choices: [{ t: 'الاضطراب', correct: true }, { t: 'الهدوء' }, { t: 'الطمأنينة' }, { t: 'السكون' }], e: 'السكينة هي الهدوء وضدها الاضطراب.' },
  { q: 'مرادف كلمة "يتباهى":', choices: [{ t: 'يتفاخر', correct: true }, { t: 'يخجل' }, { t: 'يتواضع' }, { t: 'يختفي' }], e: 'التباهي هو التفاخر وإظهار العظمة.' },
  { q: 'فجر : صبح :: غروب : ؟', choices: [{ t: 'مساء', correct: true }, { t: 'ظهيرة' }, { t: 'ليل' }, { t: 'فجر' }], e: 'الفجر يبدأ الصبح والغروب يبدأ المساء.' },
  { q: 'عكس كلمة "الولاء":', choices: [{ t: 'الخيانة', correct: true }, { t: 'الإخلاص' }, { t: 'الصدق' }, { t: 'الوفاء' }], e: 'الخيانة ضد الولاء والإخلاص.' },
  { q: 'أكمل: "كم من كلمة ... أثرها جميل، وكم من كلمة ... أثرها عليل":', choices: [{ t: 'طيبة / خبيثة', correct: true }, { t: 'خبيثة / طيبة' }, { t: 'طويلة / قصيرة' }, { t: 'بسيطة / معقدة' }], e: 'التقدير الصحيح: كلمة طيبة أثرها جميل وكلمة خبيثة أثرها عليل.' },
  { q: 'مرادف كلمة "الجدب":', choices: [{ t: 'القحط', correct: true }, { t: 'الخصوبة' }, { t: 'الأمطار' }, { t: 'الرطوبة' }], e: 'الجدب هو القحط وعدم نزول المطر.' },
  { q: 'شمس : نهار :: قمر : ؟', choices: [{ t: 'ليل', correct: true }, { t: 'سماء' }, { t: 'نجم' }, { t: 'ظلام' }], e: 'الشمس تضيء النهار والقمر يضيء الليل.' },
  { q: 'عكس كلمة "الكرم":', choices: [{ t: 'البخل', correct: true }, { t: 'السخاء' }, { t: 'العطاء' }, { t: 'الجود' }], e: 'البخل هو ضد الكرم.' },
  { q: 'اختر الكلمة التي لا تنتمي:', choices: [{ t: 'جمل' }, { t: 'حصان' }, { t: 'بقرة' }, { t: 'غراب', correct: true }], e: 'الغراب طائر بينما بقية الكلمات حيوانات رباعية.' },
  { q: 'مرادف كلمة "النهى":', choices: [{ t: 'العقل', correct: true }, { t: 'الجهل' }, { t: 'السنّ' }, { t: 'البلاغة' }], e: 'النهى تعني العقل والفطنة.' },
  { q: 'صدق : كذب :: شجاعة : ؟', choices: [{ t: 'جبن', correct: true }, { t: 'قوة' }, { t: 'بطولة' }, { t: 'إقدام' }], e: 'كما أن الكذب ضد الصدق، الجبن ضد الشجاعة.' },
];

const QUANTITATIVE: SeedQuestion[] = [
  { q: 'ما قيمة 15% من 200؟', choices: [{ t: '30', correct: true }, { t: '20' }, { t: '25' }, { t: '35' }], e: '200 × 0.15 = 30' },
  { q: 'إذا كان 5س - 4 = 21، فما قيمة س؟', choices: [{ t: '5', correct: true }, { t: '6' }, { t: '4' }, { t: '7' }], e: '5س = 25، س = 5' },
  { q: 'اكمل المتتالية: 2، 6، 12، 20، ...', choices: [{ t: '30', correct: true }, { t: '26' }, { t: '28' }, { t: '32' }], e: 'الفروق 4،6،8،10 فالتالي 20+10=30' },
  { q: 'إذا كان ثلث المجموع 12، فما المجموع؟', choices: [{ t: '36', correct: true }, { t: '24' }, { t: '40' }, { t: '48' }], e: 'المجموع = 12 × 3 = 36' },
  { q: 'ما مساحة مربع محيطه 16 سم؟', choices: [{ t: '16', correct: true }, { t: '8' }, { t: '64' }, { t: '32' }], e: 'الضلع = 16/4 = 4، المساحة = 4×4 = 16 سم²' },
  { q: 'اشترى أحمد كتاباً بـ 40 ريالاً وباعه بـ 50، ما نسبة الربح؟', choices: [{ t: '25%', correct: true }, { t: '20%' }, { t: '10%' }, { t: '30%' }], e: 'الربح 10 ريال = 25% من 40' },
  { q: 'ما ناتج 0.5 × 0.4؟', choices: [{ t: '0.2', correct: true }, { t: '2' }, { t: '0.05' }, { t: '0.45' }], e: '0.5 × 0.4 = 0.20' },
  { q: 'إذا كانت نسبة 3:5 بين رقمين مجموعهما 40، فما الرقم الأصغر؟', choices: [{ t: '15', correct: true }, { t: '25' }, { t: '10' }, { t: '20' }], e: 'الأجزاء 8، قيمة الجزء 5، الأصغر = 3×5 = 15' },
  { q: 'ما قيمة 7² + 9؟', choices: [{ t: '58', correct: true }, { t: '65' }, { t: '50' }, { t: '63' }], e: '49 + 9 = 58' },
  { q: 'مكعب حرفه 3 سم، ما حجمه؟', choices: [{ t: '27', correct: true }, { t: '9' }, { t: '18' }, { t: '12' }], e: 'الحجم = 3³ = 27 سم³' },
  { q: 'ما متوسط الأعداد 10، 20، 30، 40؟', choices: [{ t: '25', correct: true }, { t: '20' }, { t: '30' }, { t: '35' }], e: 'المجموع 100 ÷ 4 = 25' },
  { q: 'إذا كان 3س = 81، فما قيمة س؟', choices: [{ t: '4', correct: true }, { t: '3' }, { t: '5' }, { t: '2' }], e: '3⁴ = 81، س = 4' },
  { q: 'سافر شخص 240 كم في 4 ساعات، ما متوسط سرعته؟', choices: [{ t: '60', correct: true }, { t: '80' }, { t: '50' }, { t: '40' }], e: '240 ÷ 4 = 60 كم/ساعة' },
  { q: 'ما قيمة 2/3 ÷ 4/3؟', choices: [{ t: '1/2', correct: true }, { t: '1/3' }, { t: '2/9' }, { t: '3/4' }], e: '(2/3) × (3/4) = 6/12 = 1/2' },
  { q: 'مجموع عمر أب وابنه 60 سنة وعمر الأب ضعف عمر الابن، فما عمر الابن؟', choices: [{ t: '20', correct: true }, { t: '30' }, { t: '15' }, { t: '40' }], e: 'س + 2س = 60 → 3س = 60 → س = 20' },
  { q: 'ما العدد التالي في المتتالية 5، 10، 20، 40، ...؟', choices: [{ t: '80', correct: true }, { t: '60' }, { t: '50' }, { t: '70' }], e: 'كل حد ضعف سابقه، فالحد التالي 80' },
  { q: 'إذا كان 20% من عددٍ تساوي 40، فما العدد؟', choices: [{ t: '200', correct: true }, { t: '80' }, { t: '120' }, { t: '250' }], e: 'العدد = 40 ÷ 0.2 = 200' },
  { q: 'ما مساحة مستطيل طوله 8 وعرضه 5؟', choices: [{ t: '40', correct: true }, { t: '26' }, { t: '13' }, { t: '45' }], e: 'المساحة = 8 × 5 = 40' },
  { q: 'باع تاجر بضاعة بـ 880 ريالاً بعد خصم 20%، فما السعر الأصلي؟', choices: [{ t: '1100', correct: true }, { t: '1000' }, { t: '1050' }, { t: '1200' }], e: '880 ÷ 0.8 = 1100' },
  { q: 'ما قيمة 1/2 + 2/5؟', choices: [{ t: '9/10', correct: true }, { t: '7/10' }, { t: '3/7' }, { t: '2/10' }], e: '5/10 + 4/10 = 9/10' },
  { q: 'عددان مجموعهما 15 والفرق بينهما 3، فما الأكبر؟', choices: [{ t: '9', correct: true }, { t: '8' }, { t: '7' }, { t: '10' }], e: 'الأكبر = (15+3)/2 = 9' },
  { q: 'إذا كانت دقيقة واحدة تعادل 60 ثانية، فكم ثانية في 1/4 ساعة؟', choices: [{ t: '900', correct: true }, { t: '600' }, { t: '1200' }, { t: '450' }], e: '15 دقيقة × 60 = 900 ثانية' },
  { q: 'ما قيمة 6 + 7 × 2؟', choices: [{ t: '20', correct: true }, { t: '26' }, { t: '18' }, { t: '24' }], e: 'الضرب أولاً: 7×2=14 ثم 6+14=20' },
  { q: 'مع خالد 100 ريال، أعطى نصفها لأخيه وربع الباقي لصديقه، فكم بقي معه؟', choices: [{ t: '37.5', correct: true }, { t: '25' }, { t: '50' }, { t: '40' }], e: 'أعطى 50، بقي 50، أعطى ربع 50=12.5، بقي 37.5' },
  { q: 'ما قيمة الزاوية المجهولة في مثلث زاويتاه 40 و 60؟', choices: [{ t: '80', correct: true }, { t: '90' }, { t: '70' }, { t: '100' }], e: 'مجموع زوايا المثلث 180 → 180-100=80' },
  { q: 'ما 25% من 80؟', choices: [{ t: '20', correct: true }, { t: '15' }, { t: '25' }, { t: '40' }], e: '80 × 0.25 = 20' },
  { q: 'أكمل المتتالية: 1، 1، 2، 3، 5، 8، ...', choices: [{ t: '13', correct: true }, { t: '11' }, { t: '12' }, { t: '10' }], e: 'متتالية فيبوناتشي: 5+8=13' },
  { q: 'إذا تضاعف عدد الخلايا كل ساعة وبدأنا بخلية واحدة، فكم خلية بعد 4 ساعات؟', choices: [{ t: '16', correct: true }, { t: '8' }, { t: '12' }, { t: '32' }], e: '3⁽⁴⁾... 2⁴ = 16 خلية' },
  { q: 'ما ناتج 3/4 + 1/8؟', choices: [{ t: '7/8', correct: true }, { t: '4/8' }, { t: '5/8' }, { t: '6/8' }], e: '6/8 + 1/8 = 7/8' },
  { q: 'ساعة تشير إلى 3:15، ما الزاوية بين العقارب تقريباً؟', choices: [{ t: '7.5', correct: true }, { t: '15' }, { t: '90' }, { t: '30' }], e: 'عند 3:15 يمشي عقرب الساعات ربع الطريق بين 3 و4 = 7.5°' },
];

const ACHIEVEMENT: SeedQuestion[] = [
  // الرياضيات
  { q: 'ما ناتج حل المعادلة س + 5 = 12؟', choices: [{ t: '7', correct: true }, { t: '17' }, { t: '5' }, { t: '12' }], e: 'س = 12 - 5 = 7' },
  { q: 'ما جذر 144؟', choices: [{ t: '12', correct: true }, { t: '11' }, { t: '14' }, { t: '13' }], e: '12 × 12 = 144' },
  { q: 'ما دالة الجذر التربيعي للرقم 81؟', choices: [{ t: '9', correct: true }, { t: '8' }, { t: '10' }, { t: '7' }], e: '9 × 9 = 81' },
  { q: 'مساحة دائرة نصف قطرها 7 (باعتبار π = 22/7):', choices: [{ t: '154', correct: true }, { t: '44' }, { t: '49' }, { t: '308' }], e: 'المساحة = π نق² = 22/7 × 49 = 154' },
  // الفيزياء
  { q: 'ما وحدة قياس القوة؟', choices: [{ t: 'نيوتن', correct: true }, { t: 'جول' }, { t: 'واط' }, { t: 'باسكال' }], e: 'تقاس القوة بوحدة النيوتن.' },
  { q: 'السرعة = ؟', choices: [{ t: 'المسافة ÷ الزمن', correct: true }, { t: 'الزمن ÷ المسافة' }, { t: 'المسافة × الزمن' }, { t: 'الزمن × الكتلة' }], e: 'السرعة هي المسافة المقطوعة في وحدة الزمن.' },
  { q: 'ما مصدر الطاقة الأساسي في الشمس؟', choices: [{ t: 'الاندماج النووي', correct: true }, { t: 'الاحتراق الكيميائي' }, { t: 'التفكك النووي' }, { t: 'الجاذبية' }], e: 'تنتج الشمس طاقتها من الاندماج النووي.' },
  { q: 'ما قيمة تسارع الجاذبية الأرضية تقريباً؟', choices: [{ t: '9.8 م/ث²', correct: true }, { t: '8.9 م/ث²' }, { t: '10.8 م/ث²' }, { t: '12 م/ث²' }], e: 'تسارع الجاذبية ≈ 9.8 م/ث².' },
  // الكيمياء
  { q: 'ما رمز عنصر الذهب؟', choices: [{ t: 'Au', correct: true }, { t: 'Ag' }, { t: 'Al' }, { t: 'Go' }], e: 'Au من الاسم اللاتيني Aurum.' },
  { q: 'ما عدد الذرات في جزيء الماء H₂O؟', choices: [{ t: '3', correct: true }, { t: '2' }, { t: '4' }, { t: '1' }], e: 'ذرتان هيدروجين وذرة أكسجين.' },
  { q: 'ما الرقم الذري للكربون؟', choices: [{ t: '6', correct: true }, { t: '8' }, { t: '12' }, { t: '4' }], e: 'الرقم الذري للكربون 6.' },
  { q: 'ما الصيغة الكيميائية لثاني أكسيد الكربون؟', choices: [{ t: 'CO₂', correct: true }, { t: 'CO' }, { t: 'C₂O' }, { t: 'CO₃' }], e: 'ثاني أكسيد الكربون CO₂.' },
  // الأحياء
  { q: 'ما العضو المسؤول عن ضخ الدم في الجسم؟', choices: [{ t: 'القلب', correct: true }, { t: 'الكبد' }, { t: 'الرئتان' }, { t: 'الكلى' }], e: 'القلب يضخ الدم عبر الأوعية الدموية.' },
  { q: 'ما عدد كروموسومات الإنسان؟', choices: [{ t: '46', correct: true }, { t: '44' }, { t: '48' }, { t: '23' }], e: '23 زوجاً = 46 كروموسوماً.' },
  { q: 'ما العملية التي تصنع بها النباتات غذاءها؟', choices: [{ t: 'البناء الضوئي', correct: true }, { t: 'التنفس' }, { t: 'النتح' }, { t: 'الامتصاص' }], e: 'البناء الضوئي باستخدام ضوء الشمس والماء وCO₂.' },
  { q: 'ما الوحدة الأساسية لبناء الكائنات الحية؟', choices: [{ t: 'الخلية', correct: true }, { t: 'الأنسجة' }, { t: 'الأعضاء' }, { t: 'الذرة' }], e: 'الخلية هي الوحدة الأساسية للحياة.' },
  // اللغة العربية
  { q: 'ما إعراب "المعلمان مجتهدان"؟ المعل�مان:', choices: [{ t: 'مبتدأ مرفوع وعلامة رفعه الألف', correct: true }, { t: 'فاعل مرفوع بالضمة' }, { t: 'مبتدأ مرفوع بالضمة' }, { t: 'خبر مرفوع' }], e: 'المثنى يرفع بالألف.' },
  { q: 'ما ضد كلمة "الظلمة"؟', choices: [{ t: 'النور', correct: true }, { t: 'الليل' }, { t: 'السواد' }, { t: 'العرامة' }], e: 'النور ضد الظلمة.' },
];

const STEP: SeedQuestion[] = [
  // Structure / Grammar
  { q: 'She ___ to school every day.', choices: [{ t: 'goes', correct: true }, { t: 'go' }, { t: 'going' }, { t: 'gone' }], e: 'الأزمنة مع الضمير She نستخدم "goes".' },
  { q: 'I have lived in Riyadh ___ 2015.', choices: [{ t: 'since', correct: true }, { t: 'for' }, { t: 'from' }, { t: 'by' }], e: 'منذ: مع نقطة زمنية محددة نستخدم since.' },
  { q: 'He is ___ than his brother.', choices: [{ t: 'taller', correct: true }, { t: 'tall' }, { t: 'tallest' }, { t: 'more tall' }], e: 'صفة المقارنة بين اثنين: taller.' },
  { q: '___ you like some tea?', choices: [{ t: 'Would', correct: true }, { t: 'Do' }, { t: 'Are' }, { t: 'Shall' }], e: 'طلب مؤدب: Would you like...?' },
  { q: 'They ___ TV when I arrived.', choices: [{ t: 'were watching', correct: true }, { t: 'watched' }, { t: 'watch' }, { t: 'have watched' }], e: 'حدث مستمر في الماضي: were + ing.' },
  { q: 'If it ___ tomorrow, we will stay home.', choices: [{ t: 'rains', correct: true }, { t: 'rained' }, { t: 'will rain' }, { t: 'would rain' }], e: 'الجملة الشرطية الأولى: If + مضارع بسيط.' },
  { q: 'The book ___ by the teacher.', choices: [{ t: 'was written', correct: true }, { t: 'wrote' }, { t: 'writes' }, { t: 'has wrote' }], e: 'المبني للمجهول في الماضي: was + past participle.' },
  { q: 'This is the house ___ I was born.', choices: [{ t: 'where', correct: true }, { t: 'who' }, { t: 'which' }, { t: 'whose' }], e: 'مكان: نستخدم where.' },
  { q: 'She is good ___ English.', choices: [{ t: 'at', correct: true }, { t: 'in' }, { t: 'on' }, { t: 'for' }], e: 'good at: جيد في.' },
  { q: 'How ___ books do you have?', choices: [{ t: 'many', correct: true }, { t: 'much' }, { t: 'more' }, { t: 'most' }], e: 'books أسماء معدودة: many.' },
  // Vocabulary
  { q: 'ما مرادف "happy"؟', choices: [{ t: 'joyful', correct: true }, { t: 'sad' }, { t: 'angry' }, { t: 'tired' }], e: 'happy = joyful سعيد.' },
  { q: 'ما مرادف "quick"؟', choices: [{ t: 'fast', correct: true }, { t: 'slow' }, { t: 'late' }, { t: 'heavy' }], e: 'quick = fast سريع.' },
  { q: 'ما عكس "expensive"؟', choices: [{ t: 'cheap', correct: true }, { t: 'valuable' }, { t: 'costly' }, { t: 'dear' }], e: 'expensive غالٍ وضدها cheap رخيص.' },
  { q: 'ما مرادف "difficult"؟', choices: [{ t: 'hard', correct: true }, { t: 'easy' }, { t: 'simple' }, { t: 'clear' }], e: 'difficult = hard صعب.' },
  { q: 'ما مرادف "buy"؟', choices: [{ t: 'purchase', correct: true }, { t: 'sell' }, { t: 'borrow' }, { t: 'lend' }], e: 'buy = purchase يشتري.' },
  { q: 'ما عكس "fail"؟', choices: [{ t: 'succeed', correct: true }, { t: 'try' }, { t: 'start' }, { t: 'stop' }], e: 'fail يفشل وضدها succeed ينجح.' },
  { q: 'ما مرادف "big"؟', choices: [{ t: 'large', correct: true }, { t: 'small' }, { t: 'tiny' }, { t: 'short' }], e: 'big = large كبير.' },
  { q: 'ما عكس "always"؟', choices: [{ t: 'never', correct: true }, { t: 'usually' }, { t: 'often' }, { t: 'sometimes' }], e: 'always دائماً وضدها never أبداً.' },
  // Reading Comprehension
  { q: 'Read: "The Earth revolves around the Sun once every 365 days." What does the Earth do every 365 days?', choices: [{ t: 'It revolves around the Sun', correct: true }, { t: 'It revolves around the Moon' }, { t: 'It stops moving' }, { t: 'It changes shape' }], e: 'الجملة تنص أن الأرض تدور حول الشمس كل 365 يوماً.' },
  { q: 'Read: "Water freezes at zero degrees Celsius." At what temperature does water freeze?', choices: [{ t: '0°C', correct: true }, { t: '100°C' }, { t: '25°C' }, { t: '-10°C' }], e: 'تتجمد الماء عند 0 درجة مئوية.' },
  { q: 'Read: "Ali went to the market to buy some fruits. He bought apples and oranges." Where did Ali go?', choices: [{ t: 'To the market', correct: true }, { t: 'To school' }, { t: 'To hospital' }, { t: 'To the park' }], e: 'ذهب علي إلى السوق لشراء الفواكه.' },
  { q: 'Read: "The human body needs water to survive. Doctors recommend drinking at least eight glasses daily." Why is water important?', choices: [{ t: 'The body needs it to survive', correct: true }, { t: 'It makes food tastier' }, { t: 'It is cheap' }, { t: 'It is cold' }], e: 'الجسم يحتاج الماء للبقاء على قيد الحياة.' },
];

const PRACTICE: SeedQuestion[] = [
  { q: 'ما قيمة 12 × 8؟', choices: [{ t: '96', correct: true }, { t: '84' }, { t: '88' }, { t: '108' }], e: '12 × 8 = 96' },
  { q: 'مرادف كلمة "البليغ":', choices: [{ t: 'الفصيح', correct: true }, { t: 'العاجز' }, { t: 'الساكت' }, { t: 'الغريب' }], e: 'البليغ هو الفصيح في الكلام.' },
  { q: 'ما 50% من 150؟', choices: [{ t: '75', correct: true }, { t: '50' }, { t: '100' }, { t: '25' }], e: '150 ÷ 2 = 75' },
  { q: 'اختر الكلمة الشاذة:', choices: [{ t: 'كتاب' }, { t: 'قلم' }, { t: 'مسطرة' }, { t: 'نهر', correct: true }], e: 'النهر ليس من الأدوات المدرسية.' },
  { q: 'إذا كان س + 3 = 10، فما س؟', choices: [{ t: '7', correct: true }, { t: '13' }, { t: '3' }, { t: '10' }], e: 'س = 10 - 3 = 7' },
  { q: 'عكس كلمة "الصدق":', choices: [{ t: 'الكذب', correct: true }, { t: 'الوفاء' }, { t: 'الأمانة' }, { t: 'الحق' }], e: 'الكذب ضد الصدق.' },
  { q: 'ما محيط مربع طول ضلعه 6؟', choices: [{ t: '24', correct: true }, { t: '36' }, { t: '12' }, { t: '18' }], e: 'المحيط = 6 × 4 = 24' },
  { q: 'شهر : سنة :: يوم : ؟', choices: [{ t: 'أسبوع', correct: true }, { t: 'ساعة' }, { t: 'دقيقة' }, { t: 'ليلة' }], e: 'اليوم جزء من الأسبوع مثلما الشهر جزء من السنة.' },
  { q: 'ما 3⁴؟', choices: [{ t: '81', correct: true }, { t: '27' }, { t: '64' }, { t: '12' }], e: '3 × 3 × 3 × 3 = 81' },
  { q: 'أكمل: "أول الغيث ...":', choices: [{ t: 'قطر', correct: true }, { t: 'قطرة' }, { t: 'قدر' }, { t: 'قمر' }], e: 'مثل سائر: أول الغيث قطر.' },
];

// ============================================================
// تعريف الاختبارات والأقسام
// ============================================================
const DATA: SeedExamType[] = [
  {
    name: 'اختبار القدرات العامة (General Aptitude)',
    sections: [
      { name: 'القدرات اللفظية', questions: VERBAL },
      { name: 'القدرات الكمية', questions: QUANTITATIVE },
    ],
  },
  {
    name: 'الاختبار التحصيلي (Achievement)',
    sections: [
      { name: 'التحصيلي - علوم عامة', questions: ACHIEVEMENT },
    ],
  },
  {
    name: 'STEP (Standardized Test of English Proficiency)',
    sections: [
      { name: 'STEP - English', questions: STEP },
    ],
  },
  {
    name: 'الاختبارات التجريبية',
    sections: [
      { name: 'اختبار تجريبي شامل', questions: PRACTICE },
    ],
  },
];

async function seed() {
  await dataSource.initialize();
  console.log('✓ تم الاتصال بقاعدة البيانات');

  const examTypeRepo = dataSource.getRepository(ExamType);
  const sectionRepo = dataSource.getRepository(Section);
  const questionRepo = dataSource.getRepository(Question);
  const choiceRepo = dataSource.getRepository(Choice);

  let examTypesCreated = 0;
  let sectionsCreated = 0;
  let questionsAdded = 0;

  for (const exam of DATA) {
    let examType = await examTypeRepo.findOne({ where: { name: exam.name } });
    if (!examType) {
      examType = await examTypeRepo.save(examTypeRepo.create({ name: exam.name }));
      examTypesCreated++;
      console.log(`  + تعريف نوع اختبار: ${exam.name}`);
    } else {
      console.log(`  = نوع الاختبار موجود مسبقاً: ${exam.name}`);
    }

    for (const section of exam.sections) {
      let sectionEntity = await sectionRepo.findOne({
        where: { name: section.name, examType: { id: examType.id } },
      });
      if (!sectionEntity) {
        sectionEntity = await sectionRepo.save(
          sectionRepo.create({ name: section.name, examType: { id: examType.id } }),
        );
        sectionsCreated++;
        console.log(`    + إنشاء قسم: ${section.name}`);
      } else {
        console.log(`    = القسم موجود مسبقاً: ${section.name}`);
      }

      const existingQuestions = await questionRepo.find({
        where: { section: { id: sectionEntity.id } },
        relations: { choices: true },
      });
      const existingKeys = new Set(
        existingQuestions.map((q) => seedKey(q.content, q.choices)),
      );

      for (const seedQ of section.questions) {
        if (existingKeys.has(seedKey(seedQ.q, seedQ.choices))) continue;

        // خلط ترتيب الخيارات مع بقاء إجابة واحدة صحيحة
        const shuffled = shuffle(
          seedQ.choices.map((c) => ({
            content: c.t,
            is_correct: c.correct === true,
          })),
        );

        const question = await questionRepo.save(
          questionRepo.create({
            content: seedQ.q,
            explanation: seedQ.e,
            section: { id: sectionEntity.id },
          }),
        );
        await choiceRepo.save(
          choiceRepo.create(shuffled.map((c) => ({
            content: c.content,
            is_correct: c.is_correct,
            question: { id: question.id },
          }))),
        );
        questionsAdded++;
        existingKeys.add(seedKey(seedQ.q, seedQ.choices));
      }
    }
  }

  console.log('-----------------------------');
  console.log(`✓ تم الانتهاء من الزرع:`);
  console.log(`  أنواع اختبارات جديدة: ${examTypesCreated}`);
  console.log(`  أقسام جديدة: ${sectionsCreated}`);
  console.log(`  أسئلة مضافة: ${questionsAdded}`);

  await dataSource.destroy();
  console.log('✓ تم إغلاق الاتصال بقاعدة البيانات');
}

seed().catch(async (err) => {
  console.error('✗ خطأ أثناء الزرع:', err);
  await dataSource.destroy();
  process.exit(1);
});