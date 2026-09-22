

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  ValidateNested,
  IsBoolean,
  Length,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChoiceDto {
  @IsString({ message: 'نص الخيار يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'نص الخيار مطلوب' })
  content!: string;

  @IsBoolean({ message: 'يجب تحديد ما إذا كان الخيار صحيحاً أم لا' })
  is_correct!: boolean;
}

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty({ message: 'نص السؤال مطلوب' })
  content!: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsUUID('all', { message: 'يجب أن يكون معرف القسم بصيغة UUID' })
  @IsNotEmpty({ message: 'معرف القسم مطلوب' })
  sectionId!: string;

  @IsArray()
  @IsOptional()
  @ArrayMinSize(2, { message: 'يجب إضافة خيارين على الأقل' })
  @ArrayMaxSize(4, { message: 'لا يمكن إضافة أكثر من 4 خيارات' })
  @ValidateNested({ each: true })
  @Type(() => ChoiceDto)
  choices?: ChoiceDto[];
}
