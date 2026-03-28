import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpException, HttpStatus } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Code } from '../code/code';
import type { RestFailure, RestMessage } from '../vo/restVo';

@Catch()
export class AbnormalFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const payload = this.buildErrorResponse(exception, request.url);

    response.status(payload.error.status).json(payload);
  }

  private buildErrorResponse(exception: unknown, path?: string): RestFailure {
    const timestamp = new Date().toISOString();

    if (!(exception instanceof HttpException)) {
      const message = '服务器内部异常';
      return {
        code: Code.ServerError,
        data: null,
        msg: message,
        message,
        error: {
          code: Code.ServerError,
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          name: exception instanceof Error ? exception.name : 'Error',
          timestamp,
          path,
        },
      };
    }

    const status = exception.getStatus() as HttpStatus;
    const exceptionResponse = exception.getResponse();
    const normalizedResponse = this.asRecord(exceptionResponse);
    const message = this.resolveMessage(exceptionResponse, exception.message);
    const code = this.resolveCode(status, normalizedResponse);
    const details = this.resolveDetails(normalizedResponse, message);

    return {
      code,
      data: null,
      msg: message,
      message,
      error: {
        code,
        status,
        name: exception.name,
        timestamp,
        path,
        ...(details === undefined ? {} : { details }),
      },
    };
  }

  private resolveCode(
    status: HttpStatus,
    exceptionResponse?: Record<string, unknown>,
  ) {
    const responseCode = exceptionResponse?.code;
    if (typeof responseCode === 'number') {
      return responseCode;
    }

    switch (status) {
      case HttpStatus.BAD_REQUEST:
      case HttpStatus.UNPROCESSABLE_ENTITY:
        return Code.InvalidParams;
      case HttpStatus.UNAUTHORIZED:
        return Code.NotLogin;
      case HttpStatus.FORBIDDEN:
        return Code.NotAuthorized;
      case HttpStatus.NOT_FOUND:
        return Code.NotFound;
      case HttpStatus.NOT_IMPLEMENTED:
        return Code.NotImplemented;
      case HttpStatus.INTERNAL_SERVER_ERROR:
        return Code.ServerError;
      default:
        return Code.Failed;
    }
  }

  private resolveMessage(
    exceptionResponse: string | object,
    fallbackMessage: string,
  ): RestMessage {
    if (typeof exceptionResponse === 'string') {
      return exceptionResponse;
    }

    const normalizedResponse = this.asRecord(exceptionResponse);
    const message = normalizedResponse?.msg ?? normalizedResponse?.message;
    if (typeof message === 'string') {
      return message;
    }
    if (
      Array.isArray(message) &&
      message.every((item) => typeof item === 'string')
    ) {
      return message;
    }

    return fallbackMessage;
  }

  private resolveDetails(
    exceptionResponse: Record<string, unknown> | undefined,
    message: RestMessage,
  ) {
    const details = exceptionResponse?.details;
    if (details !== undefined) {
      return details;
    }

    return Array.isArray(message) ? message : undefined;
  }

  private asRecord(value: unknown) {
    if (typeof value === 'object' && value !== null) {
      return value as Record<string, unknown>;
    }
    return undefined;
  }
}
