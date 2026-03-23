import { IUser } from '@codigo/schema';
import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';

export type TCurrentUser = Omit<IUser, 'password'>;
/**
 * 获取用户信息的工具类
 * GetUserIP - 获取用户IP地址
 * GetUserAgent - 获取用户代理信息
 */
export const GetUserIP = createParamDecorator((data, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();
  const ipMatch = request.ip?.match(/\d+\.\d+\.\d+\.\d+/)?.[0] || '';
  return ipMatch;
});

export const GetUserAgent = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    return request.get('User-Agent') || '';
  },
);

export const getUserMess = createParamDecorator(
  (data, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as TCurrentUser;
  },
);
