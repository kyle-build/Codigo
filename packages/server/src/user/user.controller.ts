import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUserIP, GetUserAgent } from '../utils/GetUserMessageTool';
import { CaptchaDto } from './dto/CaptchaDto';
import { SecretTool } from 'src/utils/secretTool';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly secrectTool: SecretTool,
  ) {}

  // 查找用户
  @Get()
  findAll() {
    return this.userService.findAll();
  }

  // 图形验证码接口
  @Post('captcha')
  async getCaptcha(
    @Body() body: CaptchaDto,
    @GetUserIP() ip: string,
    @GetUserAgent() agent: string,
  ) {
    const { type } = body;
    const key = this.secrectTool.getSecret(ip + agent);
    return this.userService.getCaptcha(type, key);
  }
}
