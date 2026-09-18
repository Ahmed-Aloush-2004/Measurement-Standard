import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

interface MonthlyCountRow {
  monthDate: Date;
  count: bigint;
}

type CountableDelegate = {
  count: (args?: {
    where?: { created_at?: { gte?: Date; lt?: Date } };
  }) => Promise<number>;
};

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    // 1. Total counts across entities
    const totalUsers = await this.prisma.user.count();
    const totalExamTypes = await this.prisma.examType.count();
    const totalQuestions = await this.prisma.question.count();

    // 2. Real question count per exam type
    const examTypes = await this.prisma.examType.findMany({
      include: {
        sections: {
          include: {
            questions: true,
          },
        },
      },
    });

    const questionsPerExamType = examTypes.map((et) => ({
      name: et.name,
      questionsCount: et.sections.reduce(
        (sum, sec) => sum + sec.questions.length,
        0,
      ),
    }));

    // 3. Real monthly user growth for the past 6 months from DB
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const rawMonthlyUsers = await this.prisma.$queryRaw<MonthlyCountRow[]>`
      SELECT DATE_TRUNC('month', "created_at") AS "monthDate", COUNT(id) AS count
      FROM "users"
      WHERE "created_at" >= ${sixMonthsAgo}
      GROUP BY "monthDate"
      ORDER BY "monthDate" ASC
    `;

    // Map database results into a structured 6-month continuous timeline
    const userGrowth = this.buildMonthlyTimeline(rawMonthlyUsers, 6);

    // 4. Real Month-over-Month (MoM) Growth Percentages
    const userGrowthPercentage = await this.calculateMoMGrowth(
      this.prisma.user,
    );
    const questionGrowthPercentage = await this.calculateMoMGrowth(
      this.prisma.question,
    );

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
  private buildMonthlyTimeline(
    rawMonthlyData: MonthlyCountRow[],
    monthsCount: number,
  ) {
    const monthsArabic = [
      'يناير',
      'فبراير',
      'مارس',
      'أبريل',
      'مايو',
      'يونيو',
      'يوليو',
      'أغسطس',
      'سبتمبر',
      'أكتوبر',
      'نوفمبر',
      'ديسمبر',
    ];

    const result: Array<{ month: string; users: number }> = [];
    const now = new Date();

    // Map raw DB timestamps to count lookup
    const countsByMonthKey = new Map<string, number>();
    rawMonthlyData.forEach((row) => {
      const date = new Date(row.monthDate);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      countsByMonthKey.set(key, Number(row.count) || 0);
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
  private async calculateMoMGrowth(repo: CountableDelegate): Promise<string> {
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const currentMonthCount = await repo.count({
      where: { created_at: { gte: startOfCurrentMonth } },
    });

    const lastMonthCount = await repo.count({
      where: {
        created_at: { gte: startOfLastMonth, lt: startOfCurrentMonth },
      },
    });

    if (lastMonthCount === 0) {
      return currentMonthCount > 0 ? '+100%' : '0%';
    }

    const percentage =
      ((currentMonthCount - lastMonthCount) / lastMonthCount) * 100;
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  }
}
