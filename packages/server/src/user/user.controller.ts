import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { SendCodeDto } from './dto/sendSms.dto';
import { GetUserIP, GetUserAgent, getUserMess } from '../utils/GetUserMessageTool';
import type { TCurrentUser } from '../utils/GetUserMessageTool';
import { CaptchaDto } from './dto/captcha.dto';
import { SecretTool } from 'src/utils/SecretTool';
import { RandomTool } from 'src/utils/RandomTool';
import { RegisterDto } from './dto/register.dto';
import { PhoneLoginDto, PasswordLoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';

/**
 * 用户控制器，处理与用户相关的 HTTP 请求
 */
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly secrectTool: SecretTool,
    private readonly randomTool: RandomTool,
  ) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getCurrentUser(@getUserMess() user: TCurrentUser) {
    return user;
  }

  /**
   * 图形验证码接口
   * @param body 请求体，包含验证码类型
   * @param ip 用户 IP 地址
   * @param agent 用户代理信息
   * @returns
   */
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

  /**
   * 发送短信验证码接口
   * @param body 请求体，包含手机号、图形验证码和验证码类型
   * @param agent 用户代理信息
   * @param ip 用户 IP 地址
   * @returns 发送结果
   */
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

  /**
   * 注册接口
   * @param body 请求体，包含注册信息
   * @returns 注册结果
   */
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
   * @param body 请求体，包含手机号和验证码
   * @return 登录结果，包括 JWT token 或错误信息
   */
  @Post('phone_login')
  phoneLogin(@Body() body: PhoneLoginDto) {
    return this.userService.phoneLogin(body);
  }

  // to-do: 微信扫码登录接口
}
