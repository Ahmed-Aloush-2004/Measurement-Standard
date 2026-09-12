import { Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class QuestionFilterQueryDto {
  @IsOptional()
  @IsUUID('all', { message: 'معرف نوع الاختبار يجب أن يكون بصيغة UUID' })
  examTypeId?: string;

  @IsOptional()
  @IsUUID('all', { message: 'معرف القسم يجب أن يكون بصيغة UUID' })
  sectionId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean({ message: 'random يجب أن تكون قيمة منطقية' })
  random?: boolean;
}