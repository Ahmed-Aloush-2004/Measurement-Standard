import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateUserProgressDto } from './dto/update-user-progress.dto';
import { UserProgress } from './entities/user-progress.entity';

@Injectable()
export class UserProgressService {
  constructor(
    @InjectRepository(UserProgress)
    private readonly progressRepository: Repository<UserProgress>,
  ) {}

  async getProgress(userId: string) {
    let progress = await this.progressRepository.findOne({ 
      where: { user: { id: userId } } 
    });
    
    // إنشاء سجل افتراضي للمستخدم الجديد إذا لم يكن لديه بيانات تقدم
    if (!progress) {
      progress = this.progressRepository.create({
        user: { id: userId },
        overall_score: 0,
        tests_completed: 0,
        last_active_date: new Date(),
      });
      await this.progressRepository.save(progress);
    }
    return progress;
  }

  async updateProgress(userId: string, updateDto: UpdateUserProgressDto) {
    const progress = await this.getProgress(userId);
    
    if (updateDto.overall_score !== undefined) progress.overall_score = updateDto.overall_score;
    if (updateDto.tests_completed !== undefined) progress.tests_completed = updateDto.tests_completed;
    
    // تحديث تاريخ آخر تفاعل تلقائياً بمجرد إرسال أي تحديث
    progress.last_active_date = new Date(); 
    
    return await this.progressRepository.save(progress);
  }
}