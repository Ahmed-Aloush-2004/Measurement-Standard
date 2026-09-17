import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from 'src/auth/enums/role.enum';

export class UpdateRoleDto {
  @IsEnum(Role, { message: 'الصلاحية المحددة غير صالحة' })
  @IsNotEmpty({ message: 'الصلاحية مطلوبة' })
  role!: Role;
}