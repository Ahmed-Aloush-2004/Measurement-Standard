import { IsEmail, IsNotEmpty, IsString, IsStrongPassword, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل' })
  username!: string;

  @IsEmail({}, { message: 'صيغة البريد الإلكتروني غير صحيحة' })
  @IsNotEmpty()
  email!: string;

  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1,
  }, {
    message: 'كلمة المرور يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، رقم، ورمز (مثل @$!%*?&)'
  })
  @IsNotEmpty()
  password!: string;
}