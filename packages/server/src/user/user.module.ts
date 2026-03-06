import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { CaptchaTool } from 'src/utils/captchaTool';
import { SecretTool } from 'src/utils/secretTool';
@Module({
  controllers: [UserController],
  providers: [UserService, SecretTool, CaptchaTool],
})
export class UserModule {}
