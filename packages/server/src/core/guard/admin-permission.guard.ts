import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { resolveAdminPermissions } from '@codigo/schema';
import type { AdminPermission } from '@codigo/schema';
import type { TCurrentUser } from 'src/shared/helpers/current-user.helper';
import { ADMIN_PERMISSIONS_KEY } from './admin-permissions.decorator';

@Injectable()
export class AdminPermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions =
      this.reflector.getAllAndOverride<AdminPermission[]>(
        ADMIN_PERMISSIONS_KEY,
        [context.getHandler(), context.getClass()],
      );

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<{ user?: TCurrentUser }>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('未获取到用户信息');
    }

    const effectivePermissions = resolveAdminPermissions(
      user.global_role,
      user.admin_permissions,
    );
    const hasPermission = requiredPermissions.every((permission) =>
      effectivePermissions.includes(permission),
    );

    if (!hasPermission) {
      throw new ForbiddenException('缺少后台权限');
    }

    return true;
  }
}
