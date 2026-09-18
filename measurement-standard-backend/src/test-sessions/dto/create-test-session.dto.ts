import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class TestAnswerDto {
  @IsUUID('all', { message: 'معرف السؤال يجب أن يكون بصيغة UUID' })
  @IsNotEmpty({ message: 'معرف السؤال مطلوب' })
  questionId!: string;

  @IsUUID('all', { message: 'معرف الخيار المختار يجب أن يكون بصيغة UUID' })
  @IsNotEmpty({ message: 'الخيار المختار مطلوب' })
  selectedChoiceId!: string;
}

export class CreateTestSessionDto {
  @IsUUID('all', { message: 'يجب أن يكون معرف نوع الاختبار بصيغة UUID' })
  @IsNotEmpty({ message: 'معرف نوع الاختبار مطلوب' })
  examTypeId!: string;

  @IsArray({ message: 'يجب إرسال قائمة الإجابات' })
  @ArrayMinSize(1, { message: 'يجب إرسال إجابة واحدة على الأقل' })
  @ValidateNested({ each: true })
  @Type(() => TestAnswerDto)
  answers!: TestAnswerDto[];
}
