import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExamTypesService } from './exam-types.service';
import { ExamTypesController } from './exam-types.controller';
import { ExamType } from './entities/exam-type.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ExamType])],
  controllers: [ExamTypesController],
  providers: [ExamTypesService],
  exports: [ExamTypesService], // تصديره إذا احتجنا استخدامه في موديول آخر
})
export class ExamTypesModule {}