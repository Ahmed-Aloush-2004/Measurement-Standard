import { Injectable } from '@nestjs/common';
import { UpdateUserProgressDto } from './dto/update-user-progress.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getProgress(userId: string) {
    let progress = await this.prisma.userProgress.findFirst({
      where: { user_id: userId },
    });

    // إنشاء سجل افتراضي للمستخدم الجديد إذا لم يكن لديه بيانات تقدم
    if (!progress) {
      progress = await this.prisma.userProgress.create({
        data: {
          user_id: userId,
          overall_score: 0,
          tests_completed: 0,
          last_active_date: new Date(),
        },
      });
    }
    return progress;
  }

  async updateProgress(userId: string, updateDto: UpdateUserProgressDto) {
    const progress = await this.getProgress(userId);

    // تحديث تاريخ آخر تفاعل تلقائياً بمجرد إرسال أي تحديث
    return await this.prisma.userProgress.update({
      where: { id: progress.id },
      data: {
        overall_score: updateDto.overall_score,
        tests_completed: updateDto.tests_completed,
        last_active_date: new Date(),
      },
    });
  }
}
