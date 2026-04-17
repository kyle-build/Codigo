import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ResponseIntercept } from './core/interceptor/response.interceptor';
import { AbnormalFilter } from './core/filter/abnormal.filter';

/**
 * @description 应用程序入口文件，用于引导 NestJS 应用启动。
 *
 * bootstrap 会创建 NestJS 应用实例，并完成基础配置：
 * - 启用 CORS
 * - 设置全局 API 前缀
 * - 注册全局响应拦截器与异常过滤器
 * - 监听端口启动服务
 *
 * @returns {Promise<void>}
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
