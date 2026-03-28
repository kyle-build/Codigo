import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseIntercept } from './common/responseIntercept';
import { AbnormalFilter } from './common/abnormalFilter';

/**
 * @description: 应用程序的入口文件，负责引导 NestJS 应用程序的启动
 * bootstrap 函数是一个异步函数，使用 NestFactory 创建一个 NestJS 应用程序实例，并进行一些基本的配置，如启用 CORS、设置全局前缀、监听指定端口等。它还注册了全局的响应拦截器和异常过滤器，以统一处理 API 响应格式和异常情况。最后，调用 bootstrap 函数来启动应用程序
 * @returns void
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(new ResponseIntercept());
  app.useGlobalFilters(new AbnormalFilter());
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
