import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateUserResponseDto {
  @IsUUID('all', { message: 'معرف السؤال يجب أن يكون بصيغة UUID' })
  @IsNotEmpty({ message: 'معرف السؤال مطلوب' })
  questionId!: string;

  @IsUUID('all', { message: 'معرف الخيار المختار يجب أن يكون بصيغة UUID' })
  @IsNotEmpty({ message: 'الخيار المختار مطلوب' })
  selectedChoiceId!: string;
}