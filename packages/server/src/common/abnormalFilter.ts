import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException } from '@nestjs/common';
import type { Response } from 'express';
@Catch(HttpException)
export class AbnormalFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    // 获取请求的上下⽂
    const ctx = host.switchToHttp();
    // 获取上下⽂的 response 对象
    const response = ctx.getResponse<Response>();
    // 获取异常的状态码
    const status = exception.getStatus();
    // 异常的消息,兼容 DTO 验证提示
    const message = (exception.getResponse() as any).message;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    response.status(status).json({
      code: -1,
      data: null,
      msg: message,
    });
  }
}
