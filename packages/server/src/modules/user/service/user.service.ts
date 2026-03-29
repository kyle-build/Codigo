import { BadRequestException, Injectable } from '@nestjs/common';
import { CaptchaTool } from 'src/shared/utils/captcha.tool';
import { RedisModule } from 'src/shared/modules/redis.module';
import { TextMessageTool } from 'src/shared/utils/text-message.tool';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entity/user.entity';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import { RandomTool } from 'src/shared/utils/random.tool';
import { SecretTool } from 'src/shared/utils/secret.tool';
import { JwtService } from '@nestjs/jwt';
import { Code, XException } from 'src/core/exception';

interface Ipasswordlogin {
  phone: string;
  password: string;
}
interface IphoneLogin {
  phone: string;
  sendCode: string;
}

@Injectable()
export class UserService {
  constructor(
    private readonly captchaTool: CaptchaTool,
    private readonly redis: RedisModule,
    private readonly textMessageTool: TextMessageTool,
    private readonly randomTool: RandomTool,
    private readonly secretTool: SecretTool,
    private readonly jwtService: JwtService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getCaptcha(key: string, type: string) {
    const svgCaptcha = await this.captchaTool.generateCaptcha();
    await this.redis.set(`${type}:captcha:${key}`, svgCaptcha.text, 60);
    return { data: svgCaptcha.data, text: svgCaptcha.text };
  }

  async sendCode(
    phone: string,
    captcha: string,
    type: string,
    key: string,
    randomCode: number,
  ) {
    // 是否有获取图形验证码
    if (!(await this.redis.exists(`${type}:captcha:${key}`)))
      throw new BadRequestException('请先获取图形验证码');

    const captchaRedis = await this.redis.get(`${type}:captcha:${key}`);

    if (!(captcha.toLowerCase() === captchaRedis!.toLowerCase()))
      throw new BadRequestException('图形验证码不正确');

    // 60秒内不能重复获取
    if (await this.redis.exists(`${type}:code:${phone}`)) {
      const dateRdis = dayjs(
        Number((await this.redis.get(`${type}:code:${phone}`))!.split('_')[0]),
      );
      if (dayjs(Date.now()).diff(dateRdis, 'second') <= 60) {
        throw new BadRequestException('60秒内请勿重复获取验证码');
      }
    }

    // 发送短信验证码
    const codeRes = await this.textMessageTool.sendTextMessage(
      phone,
      randomCode,
    );

    await this.redis.del(`${type}:captcha:${key}`);

    if (codeRes.code === 200) {
      const randomCodeTime = `${Date.now()}_${randomCode}`;
      await this.redis.set(`${type}:code:${phone}`, randomCodeTime, 60);
    } else {
      await this.redis.del(`${type}:code:${phone}`);
      throw new BadRequestException('发送失败请重试');
    }
  }

  async register(
    phone: string,
    sendCode: string,
    password: string,
    confirm: string,
  ) {
    const existUser = await this.userRepository.findOne({ where: { phone } });
    if (existUser) throw new BadRequestException('该手机号已被注册');
    if (await this.redis.exists(`register:code:${phone}`)) {
      const codeRes = (await this.redis.get(`register:code:${phone}`))!.split(
        '_',
      )[1];
      if (codeRes !== sendCode)
        throw new BadRequestException('短信验证码不正确');
    } else {
      throw new BadRequestException('请先获取短信验证码');
    }
    if (password !== confirm) {
      throw new BadRequestException('输入的两次密码不一致');
    }
    const name = this.randomTool.randomNickName();
    const avatar = this.randomTool.randomImage();
    const pwd = this.secretTool.getSecret(password);
    const user = await this.userRepository.save({
      username: name,
      head_img: avatar,
      phone,
      password: pwd,
      open_id: '',
    });
    const token = this.jwtService.sign({ id: user.id });
    return {
      data: token,
      msg: '注册成功',
    };
  }

  async passwordLogin({ phone, password }: Ipasswordlogin) {
    const foundUser = await this.userRepository.findOneBy({ phone });
    if (!foundUser) {
      throw new XException({
        code: Code.LOGIN_ERROR,
        message: '账号不存在',
      });
    }

    if (foundUser.status === 'frozen') {
      throw new XException({
        code: Code.LOGIN_ERROR,
        message: '账号已被冻结，请联系管理员',
      });
    }

    const isPasswordValid =
      foundUser.password === this.secretTool.getSecret(password);
    if (!isPasswordValid) {
      throw new XException({
        code: Code.LOGIN_ERROR,
        message: '密码错误',
      });
    }

    return {
      data: this.jwtService.sign({ id: foundUser.id }),
      msg: '登录成功',
    };
  }

  async phoneLogin({ phone, sendCode }: IphoneLogin) {
    const foundUser = await this.userRepository.findOneBy({ phone });
    if (!foundUser) {
      throw new XException({
        code: Code.LOGIN_ERROR,
        message: '账号不存在',
      });
    }
    if (foundUser.status === 'frozen') {
      throw new XException({
        code: Code.LOGIN_ERROR,
        message: '账号已被冻结，请联系管理员',
      });
    }
    const codeExist = await this.redis.exists(`login:code:${phone}`);
    if (!codeExist) {
      throw new XException({
        code: Code.LOGIN_ERROR,
        message: '请先获取手机验证码',
      });
    }
    const codeRes = (await this.redis.get(`login:code:${phone}`))!.split(
      '_',
    )[1];
    if (codeRes !== sendCode) {
      throw new XException({
        code: Code.LOGIN_ERROR,
        message: '验证码错误',
      });
    }
    return {
      data: this.jwtService.sign({ id: foundUser.id }),
      msg: '登录成功',
    };
  }

  async updateProfile(
    userId: number,
    updateData: { username?: string; head_img?: string },
  ) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new BadRequestException('用户不存在');

    if (updateData.username !== undefined) user.username = updateData.username;
    if (updateData.head_img !== undefined) user.head_img = updateData.head_img;

    await this.userRepository.save(user);

    // 返回脱敏后的用户信息
    const { password: ignoredPassword, ...rest } = user;
    void ignoredPassword;
    return {
      data: rest,
      msg: '更新成功',
    };
  }

  async updatePassword(
    userId: number,
    oldPassword?: string,
    newPassword?: string,
  ) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new BadRequestException('用户不存在');

    // 如果用户设置了旧密码，需要验证旧密码
    if (oldPassword) {
      const isPasswordValid =
        user.password === this.secretTool.getSecret(oldPassword);
      if (!isPasswordValid) throw new BadRequestException('旧密码错误');
    }

    if (!newPassword) throw new BadRequestException('新密码不能为空');

    user.password = this.secretTool.getSecret(newPassword);
    await this.userRepository.save(user);

    return {
      data: null,
      msg: '密码修改成功',
    };
  }
}
