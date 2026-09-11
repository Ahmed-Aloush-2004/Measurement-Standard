import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsString()
  @IsOptional()
  explanation?: string;

  // تغيير من IsInt إلى IsUUID
  @IsUUID('all', { message: 'يجب أن يكون معرف القسم بصيغة UUID' })
  @IsNotEmpty()
  sectionId!: string;
}