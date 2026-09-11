import { IsBoolean, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateUserResponseDto {
  @IsUUID('all', { message: 'معرف السؤال يجب أن يكون بصيغة UUID' })
  @IsNotEmpty({ message: 'معرف السؤال مطلوب' })
  questionId!: string;

  @IsBoolean({ message: 'حالة الإجابة (صحيحة/خاطئة) يجب أن تكون قيمة منطقية' })
  @IsNotEmpty({ message: 'حالة الإجابة مطلوبة لتسجيل النتيجة' })
  is_correct!: boolean;
}