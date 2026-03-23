import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CaptchaTool } from 'src/utils/captchaTool';
import { SecretTool } from 'src/utils/SecretTool';
import { TextMessageTool } from 'src/utils/TextMessageTool';
import { RandomTool } from 'src/utils/RandomTool';
/**
 * 用户模块，包含用户相关的服务和控制器
 * @description 该模块负责处理与用户相关的功能，包括图形验证码生成、短信验证码发送、用户注册和登录等。通过引入各种工具类和服务来实现这些功能，确保代码的模块化和可维护性
 */
@Module({
  controllers: [UserController],
  providers: [
    UserService,
    SecretTool,
    CaptchaTool,
    TextMessageTool,
    RandomTool,
  ],
})
export class UserModule {}
