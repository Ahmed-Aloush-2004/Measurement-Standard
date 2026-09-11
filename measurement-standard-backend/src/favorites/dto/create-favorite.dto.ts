import { IsNotEmpty, IsUUID } from 'class-validator';

export class CreateFavoriteDto {
  @IsUUID('all', { message: 'يجب أن يكون معرف السؤال بصيغة UUID' })
  @IsNotEmpty({ message: 'معرف السؤال مطلوب' })
  questionId!: string;
}