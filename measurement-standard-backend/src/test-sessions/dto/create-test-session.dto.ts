import { IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';

export class CreateTestSessionDto {
  @IsUUID('all', { message: 'يجب أن يكون معرف نوع الاختبار بصيغة UUID' })
  @IsNotEmpty({ message: 'معرف نوع الاختبار مطلوب' })
  examTypeId!: string;

  @IsInt({ message: 'يجب أن تكون النتيجة رقماً صحيحاً' })
  @Min(0)
  @IsNotEmpty({ message: 'النتيجة مطلوبة' })
  score!: number;

  @IsInt({ message: 'يجب أن يكون إجمالي الأسئلة رقماً صحيحاً' })
  @Min(1)
  @IsNotEmpty({ message: 'إجمالي الأسئلة مطلوب' })
  total_questions!: number;
}