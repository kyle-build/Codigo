import { Code } from './code';
import { HttpException, HttpStatus } from '@nestjs/common';
import type { RestMessage } from '../vo/restVo';

/**
 * 拦截异常统一处理
 */
export class XException extends HttpException {
  code: Code;

  constructor(params: {
    code: Code;
    message: RestMessage;
    status?: HttpStatus;
    details?: unknown;
  }) {
    super(
      {
        code: params.code,
        msg: params.message,
        message: params.message,
        ...(params.details === undefined ? {} : { details: params.details }),
      },
      params.status ?? XException.mapStatus(params.code),
    );

    this.code = params.code;
  }

  private static mapStatus(code: Code): HttpStatus {
    switch (code) {
      case Code.NotLogin:
        return HttpStatus.UNAUTHORIZED;
      case Code.NotAuthorized:
        return HttpStatus.FORBIDDEN;
      case Code.NotFound:
        return HttpStatus.NOT_FOUND;
      case Code.ServerError:
      case Code.DatabaseError:
        return HttpStatus.INTERNAL_SERVER_ERROR;
      default:
        return HttpStatus.BAD_REQUEST;
    }
  }
}
