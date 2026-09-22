

import { IsNotEmpty, IsString } from 'class-validator';

export class CreateExamTypeDto {
  @IsString({
    message: 'يجب أن يكون اسم الاختبار نصاً',
  })
  @IsNotEmpty({
    message: 'اسم الاختبار مطلوب',
  })
  name!: string;

  @IsString({
    message: 'رمز الاختبار يجب أن يكون نصاً',
  })
  @IsNotEmpty({
    message: 'رمز الاختبار مطلوب',
  })
  code!: string;
}
