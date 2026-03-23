import type {
  ExecutionContext,
  NestInterceptor,
  CallHandler,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs';
import { Injectable } from '@nestjs/common';
/**
 * 拦截器 成功返回的统⼀响应格式
 */
@Injectable()
export class ResponseIntercept implements NestInterceptor {
  // 调⽤ next 处理器，执⾏⾥⾯ handel()，使⽤ pipe 操作符进⾏管道处理，map 操作符映射数据
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        return {
          code: 0,
          data,
        };
      }),
    );
  }
}
