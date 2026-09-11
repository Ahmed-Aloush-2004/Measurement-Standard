import { IsNotEmpty, IsString } from 'class-validator';

export class CreateExamTypeDto {
  @IsString({ message: 'يجب أن يكون اسم الاختبار نصاً' })
  @IsNotEmpty({ message: 'اسم الاختبار مطلوب ولا يمكن أن يكون فارغاً' })
  name!: string;
}