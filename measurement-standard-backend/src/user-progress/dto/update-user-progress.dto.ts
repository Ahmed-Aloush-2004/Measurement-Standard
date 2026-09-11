import { IsNumber, IsOptional } from 'class-validator';

export class UpdateUserProgressDto {
  @IsNumber({}, { message: 'يجب أن تكون النسبة المئوية رقماً' })
  @IsOptional()
  overall_score?: number;

  @IsNumber({}, { message: 'يجب أن يكون عدد الاختبارات رقماً' })
  @IsOptional()
  tests_completed?: number;
}