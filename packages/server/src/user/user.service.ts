import { BadRequestException, Injectable } from '@nestjs/common';
import { CaptchaTool } from '../utils/captchaTool';
import { RedisModule } from '../utils/modules/redis.module';
import { TextMessageTool } from '../utils/TextMessageTool';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import dayjs from 'dayjs';
import { RandomTool } from '../utils/RandomTool';
import { SecretTool } from '../utils/SecretTool';
import { JwtService } from '@nestjs/jwt';

interface Ipasswordlogin {
  phone: string;
  password: string;
}
interface IphoneLogin {
  phone: string;
  sendCode: string;
}
/**
 * 用户服务，处理与用户相关的业务逻辑
 * 包括图形验证码生成、短信验证码发送、用户注册和登录等功能
 * @description 该服务通过注入各种工具类和数据库仓库来实现用户相关的功能，确保代码的模块化和可维护性
 */
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

  /**
   * 图形验证码服务
   * @param key 唯一标识符，通常由用户 IP 和 User Agent 组合生成
   * @param type 验证码类型，例如注册、登录等
   * @returns 包含 SVG 图形验证码数据和文本的对象
   * @description 生成并返回图形验证码，同时将验证码文本存储在 Redis 中以供后续验证使用
   */
  async getCaptcha(key: string, type: string) {
    const svgCaptcha = await this.captchaTool.generateCaptcha();
    this.redis.set(`${type}:captcha:${key}`, svgCaptcha.text, 60);
    return { data: svgCaptcha.data, text: svgCaptcha.text };
  }

  /**
   * 短信验证码服务
   * @param phone 手机号
   * @param captcha 用户输入的图形验证码
   * @param type 验证码类型
   * @param key 唯一标识符
   * @param randomCode 随机生成的短信验证码
   * @returns 发送结果
   */
  async sendCode(
    phone: string,
    captcha: string,
    type: string,
    key: string,
    randomCode: number,
  ) {
    // 60秒内不能重复获取
    if (await this.redis.exists(`${type}:code:${phone}`)) {
      const dateRdis = dayjs(
        Number((await this.redis.get(`${type}:code:${phone}`))!.split('_')[0]),
      );
      if (dayjs(Date.now()).diff(dateRdis, 'second') <= 60) {
        throw new BadRequestException('60秒内请勿重复获取验证码');
      }
    }

    // 是否有获取图形验证码
    if (!(await this.redis.exists(`${type}:captcha:${key}`)))
      throw new BadRequestException('请先获取图形验证码');

    // 对比用户传入的图形验证码和存入 redis 的是否一致
    const captchaRedis = await this.redis.get(`${type}:captcha:${key}`);

    if (!(captcha.toLowerCase() === captchaRedis!.toLowerCase()))
      throw new BadRequestException('图形验证码不正确');

    // 发送短信验证码
    const codeRes = await this.textMessageTool.sendTextMessage(
      phone,
      randomCode,
    );

    // 删除图形验证码
    this.redis.del(`${type}:captcha:${key}`);

    if (codeRes.code === 200) {
      // 储存短信验证码
      const randomCodeTime = `${Date.now()}_${randomCode}`;
      this.redis.set(`${type}:code:${phone}`, randomCodeTime, 60);
    } else {
      this.redis.del(`${type}:code:${phone}`);
      throw new BadRequestException('发送失败请重试');
    }
  }

  /**
   * 注册服务
   * @param phone 手机号
   * @param sendCode 用户输入的短信验证码
   * @param password 用户输入的密码
   * @param confirm 用户输入的确认密码
   * @return 注册结果，包括 JWT token 或错误信息
   * @description 处理用户注册逻辑，包括手机号查重、短信验证码验证、密码确认、用户数据存储和 JWT token 生成
   */
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

  /**
   * 账号密码登录服务
   * @param phone 用户输入的手机号
   * @param password 用户输入的密码
   * @return 登录结果，包括 JWT token 或错误信息
   * @description 处理账号密码登录逻辑，包括用户查找、密码验证和 JWT token 生成
   * @throws BadRequestException 当账号不存在或密码错误时抛出异常
   */

  async passwordLogin({ phone, password }: Ipasswordlogin) {
    const foundUser = await this.userRepository.findOneBy({ phone });
    if (!foundUser) throw new BadRequestException('账号不存在');
    const isPasswordValid =
      foundUser.password === this.secretTool.getSecret(password);
    if (!isPasswordValid) {
      throw new BadRequestException('密码错误');
    }
    return {
      data: this.jwtService.sign({ id: foundUser.id }),
      msg: '登录成功',
    };
  }

  /**
   * 验证码登录服务
   * @param phone 用户输入的手机号
   * @param sendCode 用户输入的短信验证码
   * @return 登录结果，包括 JWT token 或错误信息
   * @description 处理验证码登录逻辑，包括用户查找、短信验证码验证和 JWT token 生成
   * @throws BadRequestException 当账号不存在、未获取验证码或验证码错误时抛出异常
   */
  async phoneLogin({ phone, sendCode }: IphoneLogin) {
    const foundUser = await this.userRepository.findOneBy({ phone });
    if (!foundUser) throw new BadRequestException('账号不存在');
    const codeExist = await this.redis.exists(`login:code:${phone}`);
    if (!codeExist) throw new BadRequestException('请先获取手机验证码');
    const codeRes = (await this.redis.get(`login:code:${phone}`))!.split(
      '_',
    )[1];
    if (codeRes !== sendCode) throw new BadRequestException('验证码错误');
    return {
      data: this.jwtService.sign({ id: foundUser.id }),
      msg: '登录成功',
    };
  }

  /**
   * 更新个人信息服务
   */
  async updateProfile(userId: number, updateData: { username?: string; head_img?: string }) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new BadRequestException('用户不存在');

    if (updateData.username !== undefined) user.username = updateData.username;
    if (updateData.head_img !== undefined) user.head_img = updateData.head_img;

    await this.userRepository.save(user);
    
    // 返回脱敏后的用户信息
    const { password, ...rest } = user;
    return {
      data: rest,
      msg: '更新成功',
    };
  }

  /**
   * 修改密码服务
   */
  async updatePassword(userId: number, oldPassword?: string, newPassword?: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) throw new BadRequestException('用户不存在');

    // 如果用户设置了旧密码，需要验证旧密码
    if (oldPassword) {
      const isPasswordValid = user.password === this.secretTool.getSecret(oldPassword);
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

