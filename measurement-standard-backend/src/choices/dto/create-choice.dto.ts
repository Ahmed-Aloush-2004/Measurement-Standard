import { IsBoolean, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateChoiceDto {
  @IsString({ message: 'نص الخيار يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'نص الخيار مطلوب' })
  content!: string;

  @IsBoolean({
    message: 'يجب تحديد ما إذا كان الخيار صحيحاً أم لا (true/false)',
  })
  @IsNotEmpty({ message: 'حالة الخيار (صحيح/خاطئ) مطلوبة' })
  is_correct!: boolean;

  @IsUUID('all', { message: 'معرف السؤال يجب أن يكون بصيغة UUID' })
  @IsNotEmpty({ message: 'معرف السؤال مطلوب لربط الخيار به' })
  questionId!: string;
}
