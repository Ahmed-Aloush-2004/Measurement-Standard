
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateSectionDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  // تغيير من IsInt إلى IsUUID
  @IsUUID('all', { message: 'يجب أن يكون معرف نوع الاختبار بصيغة UUID' })
  @IsNotEmpty()
  examTypeId!: string;
}