import { Code } from '../code/code';

export type RestMessage = string | string[];

export interface RestSuccess<TData = unknown> {
  code: Code.success;
  data: TData;
  msg?: RestMessage;
  message?: RestMessage;
}

export interface RestErrorMeta {
  code: number;
  status: number;
  name: string;
  timestamp: string;
  path?: string;
  details?: unknown;
}

export interface RestFailure {
  code: number;
  data: null;
  msg: RestMessage;
  message: RestMessage;
  error: RestErrorMeta;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function normalizeSuccessResponse(payload: unknown): RestSuccess {
  let data = payload;
  let message: RestMessage | undefined;

  if (isRecord(payload)) {
    const payloadMessage = payload.msg ?? payload.message;
    if (
      typeof payloadMessage === 'string' ||
      (Array.isArray(payloadMessage) &&
        payloadMessage.every((item) => typeof item === 'string'))
    ) {
      message = payloadMessage;
    }

    if ('data' in payload) {
      data = payload.data;
    } else if (message !== undefined) {
      const { msg, message: ignoredMessage, ...rest } = payload;
      void msg;
      void ignoredMessage;
      data = Object.keys(rest).length > 0 ? rest : null;
    }
  }

  const response: RestSuccess = {
    code: Code.success,
    data: data ?? null,
  };

  if (message !== undefined) {
    response.msg = message;
    response.message = message;
  }

  return response;
}
