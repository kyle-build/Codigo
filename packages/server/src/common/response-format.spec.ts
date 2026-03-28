import { BadRequestException } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import { firstValueFrom, of } from 'rxjs';
import { Code, XException } from '../code';
import { AbnormalFilter } from './abnormalFilter';
import { ResponseIntercept } from './responseIntercept';
import { normalizeSuccessResponse } from '../vo/restVo';

describe('response format', () => {
  it('normalizes success payload with message', () => {
    expect(
      normalizeSuccessResponse({
        data: { id: 1 },
        msg: '操作成功',
      }),
    ).toEqual({
      code: Code.success,
      data: { id: 1 },
      msg: '操作成功',
      message: '操作成功',
    });
  });

  it('normalizes success payload without data to null', () => {
    expect(
      normalizeSuccessResponse({
        msg: '删除成功',
      }),
    ).toEqual({
      code: Code.success,
      data: null,
      msg: '删除成功',
      message: '删除成功',
    });
  });

  it('maps interceptor response to unified structure', async () => {
    const interceptor = new ResponseIntercept();
    const result = await firstValueFrom(
      interceptor.intercept({} as never, {
        handle: () =>
          of({
            data: 'token',
            msg: '登录成功',
          }),
      }),
    );

    expect(result).toEqual({
      code: Code.success,
      data: 'token',
      msg: '登录成功',
      message: '登录成功',
    });
  });

  it('keeps custom exception code and metadata', () => {
    const filter = new AbnormalFilter();
    const response = createResponseMock();

    filter.catch(
      new XException({
        code: Code.LOGIN_ERROR,
        message: '密码错误',
      }),
      createHost(response, '/api/auth/tokens/password'),
    );
    const payload = getJsonPayload(response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(payload).toMatchObject({
      code: Code.LOGIN_ERROR,
      data: null,
      msg: '密码错误',
      message: '密码错误',
      error: {
        code: Code.LOGIN_ERROR,
        status: 400,
        name: 'XException',
        path: '/api/auth/tokens/password',
      },
    });
  });

  it('maps bad request exception to invalid params code', () => {
    const filter = new AbnormalFilter();
    const response = createResponseMock();
    const exception = new BadRequestException(['phone限制不为空!']);

    filter.catch(exception, createHost(response, '/api/user/password_login'));
    const payload = getJsonPayload(response);

    expect(response.status).toHaveBeenCalledWith(400);
    expect(payload).toMatchObject({
      code: Code.InvalidParams,
      msg: ['phone限制不为空!'],
      message: ['phone限制不为空!'],
      error: {
        code: Code.InvalidParams,
        status: 400,
        details: ['phone限制不为空!'],
      },
    });
  });

  it('maps unknown error to server error response', () => {
    const filter = new AbnormalFilter();
    const response = createResponseMock();

    filter.catch(
      new Error('boom'),
      createHost(response, '/api/resources/upload'),
    );
    const payload = getJsonPayload(response);

    expect(response.status).toHaveBeenCalledWith(500);
    expect(payload).toMatchObject({
      code: Code.ServerError,
      msg: '服务器内部异常',
      message: '服务器内部异常',
      error: {
        code: Code.ServerError,
        status: 500,
        name: 'Error',
      },
    });
  });
});

function createResponseMock() {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  };
  response.status.mockReturnValue(response);
  return response;
}

function getJsonPayload(response: ReturnType<typeof createResponseMock>) {
  const [[payload]] = response.json.mock.calls as [[unknown]];
  return payload;
}

function createHost(
  response: ReturnType<typeof createResponseMock>,
  url: string,
): ArgumentsHost {
  return {
    switchToHttp: () => ({
      getResponse: () => response,
      getRequest: () => ({ url }),
    }),
  } as ArgumentsHost;
}
