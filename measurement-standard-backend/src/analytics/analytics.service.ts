import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ExamType } from "src/exam-types/entities/exam-type.entity";
import { Question } from "src/questions/entities/question.entity";
import { Section } from "src/sections/entities/section.entity";
import { User } from "src/users/entities/user.entity";
import { Repository } from "typeorm";


@Injectable()
export class AnalyticsService {
    constructor(
        @InjectRepository(User) private userRepo: Repository<User>,
        @InjectRepository(ExamType) private examTypeRepo: Repository<ExamType>,
        @InjectRepository(Section) private sectionRepo: Repository<Section>,
        @InjectRepository(Question) private questionRepo: Repository<Question>,
    ) { }




  async getDashboardStats() {
    // 1. Total counts across entities
    const totalUsers = await this.userRepo.count();
    const totalExamTypes = await this.examTypeRepo.count();
    const totalQuestions = await this.questionRepo.count();

    // 2. Real question count per exam type using QueryBuilder
    const questionsPerExamTypeRaw = await this.examTypeRepo
      .createQueryBuilder('examType')
      .leftJoin('examType.sections', 'section')
      .leftJoin('section.questions', 'question')
      .select('examType.name', 'name')
      .addSelect('COUNT(question.id)', 'questionsCount')
      .groupBy('examType.id')
      .getRawMany();

    const questionsPerExamType = questionsPerExamTypeRaw.map((row) => ({
      name: row.name,
      questionsCount: parseInt(row.questionsCount, 10) || 0,
    }));

    // 3. Real monthly user growth for the past 6 months from DB
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const rawMonthlyUsers = await this.userRepo
    .createQueryBuilder('user')
    .select(`DATE_TRUNC('month', "user"."created_at")`, 'monthDate')
    .addSelect('COUNT("user"."id")', 'count')
    .where('"user"."created_at" >= :startDate', { startDate: sixMonthsAgo })
    .groupBy('"monthDate"')
    .orderBy('"monthDate"', 'ASC')
    .getRawMany();

    // Map database results into a structured 6-month continuous timeline
    const userGrowth = this.buildMonthlyTimeline(rawMonthlyUsers, 6);

    // 4. Real Month-over-Month (MoM) Growth Percentages
    const userGrowthPercentage = await this.calculateMoMGrowth(this.userRepo);
    const questionGrowthPercentage = await this.calculateMoMGrowth(this.questionRepo);

    return {
      summary: {
        totalUsers,
        totalExamTypes,
        totalQuestions,
        userGrowthPercentage,
        questionGrowthPercentage,
      },
      questionsPerExamType,
      userGrowth,
    };
  }

  /**
   * Generates a continuous N-month array in Arabic with actual user counts.
   */
  private buildMonthlyTimeline(rawMonthlyData: any[], monthsCount: number) {
    const monthsArabic = [
      'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
    ];

    const result: Array<{ month: string; users: number }> = [];
    const now = new Date();

    // Map raw DB timestamps to count lookup
    const countsByMonthKey = new Map<string, number>();
    rawMonthlyData.forEach((row) => {
      const date = new Date(row.monthDate);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      countsByMonthKey.set(key, parseInt(row.count, 10) || 0);
    });

    let runningTotal = 0;

    for (let i = monthsCount - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const yearMonthKey = `${d.getFullYear()}-${d.getMonth()}`;
      const monthArabicName = monthsArabic[d.getMonth()];

      const newUsersThisMonth = countsByMonthKey.get(yearMonthKey) || 0;
      runningTotal += newUsersThisMonth;

      result.push({
        month: monthArabicName,
        users: runningTotal,
      });
    }

    return result;
  }

  /**
   * Calculates real Month-over-Month growth percentage comparing current vs previous month.
   */



private async calculateMoMGrowth(repo: Repository<any>): Promise<string> {
  const now = new Date();
  const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const currentMonthCount = await repo
    .createQueryBuilder('entity')
    .where('entity.created_at >= :start', { start: startOfCurrentMonth })
    .getCount();

  const lastMonthCount = await repo
    .createQueryBuilder('entity')
    .where('entity.created_at >= :start AND entity.created_at < :end', {
      start: startOfLastMonth,
      end: startOfCurrentMonth,
    })
    .getCount();

  if (lastMonthCount === 0) {
    return currentMonthCount > 0 ? '+100%' : '0%';
  }

  const percentage = ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100;
  const sign = percentage >= 0 ? '+' : '';
  return `${sign}${percentage.toFixed(1)}%`;
}

}




// async getDashboardStats() {
//     const totalUsers = await this.userRepo.count();
//     const totalExamTypes = await this.examTypeRepo.count();
//     const totalQuestions = await this.questionRepo.count();

//     // Fetch question breakdown per exam type
//     const examTypes = await this.examTypeRepo.find({
//         relations: {
//             sections: {
//             questions: true,
//             },
//         },
//         });
//       const questionsPerExamType = examTypes.map((et) => {
//       const qCount = et.sections?.reduce((sum, sec) => sum + (sec.questions?.length || 0), 0) || 0;
//       return { name: et.name, questionsCount: qCount };
//     });

//     // Mock 6-month growth sample data (connect to DB created_at fields for production)
//     const userGrowth = [
//       { month: 'أبريل', users: Math.round(totalUsers * 0.4) },
//       { month: 'مايو', users: Math.round(totalUsers * 0.55) },
//       { month: 'يونيو', users: Math.round(totalUsers * 0.7) },
//       { month: 'يوليو', users: Math.round(totalUsers * 0.85) },
//       { month: 'أغسطس', users: Math.round(totalUsers * 0.95) },
//       { month: 'سبتمبر', users: totalUsers },
//     ];

//     return {
//       summary: {
//         totalUsers,
//         totalExamTypes,
//         totalQuestions,
//         userGrowthPercentage: '+14.5%',
//         questionGrowthPercentage: '+8.2%',
//       },
//       questionsPerExamType,
//       userGrowth,
//     };
//   }




//   private async calculateMoMGrowth(repo: Repository<any>): Promise<string> {
//     const now = new Date();
//     const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//     const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

//     const currentMonthCount = await repo
//       .createQueryBuilder('entity')
//       .where('entity.createdAt >= :start', { start: startOfCurrentMonth })
//       .getCount();

//     const lastMonthCount = await repo
//       .createQueryBuilder('entity')
//       .where('entity.createdAt >= :start AND entity.createdAt < :end', {
//         start: startOfLastMonth,
//         end: startOfCurrentMonth,
//       })
//       .getCount();

//     if (lastMonthCount === 0) {
//       return currentMonthCount > 0 ? '+100%' : '0%';
//     }

//     const percentage = ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100;
//     const sign = percentage >= 0 ? '+' : '';
//     return `${sign}${percentage.toFixed(1)}%`;
//   }