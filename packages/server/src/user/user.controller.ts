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
import { SendCodeDto } from './dto/sendSms.dto';
import { GetUserIP, GetUserAgent } from '../utils/GetUserMessageTool';
import { CaptchaDto } from './dto/captcha.dto';
import { SecretTool } from 'src/utils/secretTool';
import { RandomTool } from 'src/utils/RandomTool';
import { RedisModule } from 'src/utils/modules/redis.module';
import { TextMessageTool } from 'src/utils/TextMessageTool';
import { RegisterDto } from './dto/register.dto';
import { PhoneLoginDto, PasswordLoginDto } from './dto/login.dto';
@Controller('user')
export class UserController {
  constructor(
    private readonly redis: RedisModule,
    private readonly userService: UserService,
    private readonly secrectTool: SecretTool,
    private readonly textMessageTool: TextMessageTool,
    private readonly randomTool: RandomTool,
  ) {}

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

  // 测试接口
  // @Post('send_code')
  // async sendCode() {
  //   console.log('发送短信接口被调用');
  //   const phone = '19839704896';
  //   const randomCode = '1234';
  //   const codeRes = await this.textMessageTool.sendTextMessage(
  //     phone,
  //     randomCode,
  //   );
  //   return codeRes;
  // }

  // 发送短信验证码接口
  @Post('send_code')
  async sendCode(
    @Body() body: SendCodeDto,
    @GetUserAgent() agent: string,
    @GetUserIP() ip: string,
  ) {
    const { phone, captcha, type } = body;
    const key = this.secrectTool.getSecret(ip + agent);
    return this.userService.sendCode(
      phone,
      captcha,
      type,
      key,
      this.randomTool.randomCode(),
    );
  }

  // 注册接口
  @Post('register')
  register(@Body() body: RegisterDto) {
    const { phone, sendCode, password, confirm } = body;
    return this.userService.register(phone, sendCode, password, confirm);
  }

  /**
   * 账号密码登录控制器
   */
  @Post('password_login')
  passwordLogin(@Body() body: PasswordLoginDto) {
    return this.userService.passwordLogin(body);
  }

  /**
   * 手机验证码登录控制器
   */
  @Post('phone_login')
  phoneLogin(@Body() body: PhoneLoginDto) {
    return this.userService.phoneLogin(body);
  }

  // to-do: 微信扫码登录接口
}
