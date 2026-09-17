import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsOptional, IsUUID, Max, Min } from 'class-validator';

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
  @Max(30)
  limit?: number = 30;


  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number  = 1;


  @IsEnum({DESC:'DESC',ASC:'ASC'})
  @IsNotEmpty()
  order?: string = 'ASC';

}