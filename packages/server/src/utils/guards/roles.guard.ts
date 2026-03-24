import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import type { GlobalRole } from '@codigo/schema';
import type { TCurrentUser } from '../GetUserMessageTool';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<GlobalRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<{ user: TCurrentUser }>();
    if (!user) {
      throw new ForbiddenException('User not found in request');
    }
    
    // 冻结用户不允许进行任何需要权限的操作
    if (user.status === 'frozen') {
      throw new ForbiddenException('账号已被冻结，请联系管理员');
    }

    const hasRole = requiredRoles.includes(user.global_role);
    if (!hasRole) {
      throw new ForbiddenException('权限不足，需要管理员权限');
    }

    return true;
  }
}
