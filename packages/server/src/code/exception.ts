import { Code } from './code';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * 拦截异常统一处理
 */
export class XException extends HttpException {
  code: Code;
  codeN: number;

  constructor(params: { code: Code; message: string; status?: HttpStatus }) {
    super(
      {
        code: params.code,
        codeN: params.code,
        message: params.message,
      },
      params.status ?? XException.mapStatus(params.code),
    );

    this.code = params.code;
    this.codeN = params.code;
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
