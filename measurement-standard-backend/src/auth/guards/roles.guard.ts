import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // إذا لم يتم تحديد أدوار معينة للمسار، اسمح بالوصول
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    // التحقق من وجود المستخدم، وأن دوره ضمن الأدوار المطلوبة أو أنه مشرف عام
    const hasRole = () =>
      user.role === Role.SUPER_ADMIN || requiredRoles.includes(user.role);

    if (user && user.role && hasRole()) {
      return true;
    }

    throw new ForbiddenException(
      'لا تملك الصلاحيات الكافية للوصول إلى هذا المسار',
    );
  }
}
