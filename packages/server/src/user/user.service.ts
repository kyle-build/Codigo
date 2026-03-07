import { Injectable } from '@nestjs/common';
import { SecretTool } from 'src/utils/secretTool';
import { RedisModule } from 'src/utils/modules/redis.module';
import { CaptchaTool } from 'src/utils/captchaTool';
import { RandomTool } from 'src/utils/RandomTool';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class UserService {
  constructor(
    private readonly redisModule: RedisModule,
    private readonly captchaTool: CaptchaTool,
    private readonly secretTool: SecretTool,
    private readonly jwtService: JwtService,
    private readonly randomTool: RandomTool,
    @InjectRepository(User) private readonly userRepository,
  ) {}
  /**
   * 图形验证码功能
   * @param type 验证码类型
   * @param key 验证码的唯一标识，可以使用用户的 IP 地址和 User-Agent 生成一个唯一的 key
   */
  async getCaptcha(type: string, key: string) {
    const svgCaptcha = await this.captchaTool.generateCaptcha();
    this.redisModule.set(`${type}:captcha:${key}`, svgCaptcha.text, 60);
    return { data: svgCaptcha.data, text: svgCaptcha.text };
  }

  // 查找用户
  findAll() {
    return `This action returns all user`;
  }

  /**
   * ⼿机验证码服务
   * @param phone ⼿机
   * @param captcha 图形验证码
   * @param type 类型
   * @param key key
   * @param randomCode 随机验证码
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
      const dateRedis = dayjs(
        Number((await this.redis.get(`${type}:code:${phone}`))!.split('_')[0]),
      );
      if (dayjs(Date.now()).diff(dateRedis, 'second') <= 60)
        throw new BadRequestException('请勿重复获取短信验证码');
    }
    // 是否有图形验证
    if (!(await this.redis.exists(`${type}:captcha:${key}`)))
      throw new BadRequestException('请先获取图形验证码');
    if (!captcha) throw new BadRequestException('请输⼊图形验证码');
    // 对⽐⽤户的图形验证码和redis储存的是否⼀致
    const captchaRedis = await this.redis.get(`${type}:captcha:${key}`);
    if (!(String(captcha).toLowerCase() === captchaRedis!.toLowerCase()))
      throw new BadRequestException('图形验证码不正确');
    // 发送⼿机验证码
    const codeRes = await this.textMessageTool.sendMsgCode(phone, randomCode);
    // 获取当前时间拼接验证码
    const randomCodeTime = `${Date.now()}_${randomCode}`;
    this.redis.set(`${type}:code:${phone}`, randomCodeTime, 600);
    // 删除图形验证码
    this.redis.del(`${type}:captcha:${key}`);
    if (codeRes.code === 0) {
      return null;
    } else {
      this.redis.del(`${type}:code:${phone}`);
      throw new BadRequestException('发送失败, 请重试');
    }
  }

  /**
   * 注册功能
   */
  async register(
    phone: string,
    sendCode: string,
    password: string,
    confirm: string,
  ) {
    // 手机号注册查重
    const existUser = await this.userRepository.findOne({ where: { phone } });
    if (existUser) throw new BadRequestException('该手机号已被注册');

    // 用户传入的短信验证码对比 redis 中的是否一致
    if (await this.redis.exists(`register:code:${phone}`)) {
      const codeRes = (await this.redis.get(`register:code:${phone}`)!).split(
        '_',
      )[1];
      if (codeRes !== sendCode)
        throw new BadRequestException('短信验证码不正确');
    } else {
      throw new BadRequestException('请先获取短信验证码');
    }

    // 验证二次密码
    if (password !== confirm) {
      throw new BadRequestException('输入的两次密码不一致');
    }

    // 随机生成头像和昵称
    const name = this.randomTool.randomName();
    const avatar = this.randomTool.randomAvatar();

    // 生成加密密码
    const pwd = this.secretTool.getSecret(password);

    // 将新用户的数据插入数据库
    const user = await this.userRepository.save({
      username: name,
      head_img: avatar,
      phone,
      password: pwd,
      open_id: '',
    });

    // 生成 7 天过期的 token
    const token = this.jwtService.sign({ id: user.id });

    return {
      data: token,
      msg: '注册成功',
    };
  }

  /**
   * 账号密码登录服务
   */
  async passwordLogin({ phone, password }) {
    // 查找用户是否注册
    const foundUser = await this.userRepository.findOneBy({ phone });
    if (!foundUser) throw new BadRequestException('账号不存在');

    // 检查密码是否正确
    const isPasswordValid =
      foundUser.password === this.secretTool.getSecret(password);
    if (!isPasswordValid) throw new BadRequestException('密码错误');

    return {
      data: this.jwtService.sign({ id: foundUser.id }),
      msg: '登录成功',
    };
  }

  /**
   * 验证码登录服务
   */
  async phoneLogin({ phone, sendCode }) {
    // 查找用户是否注册
    const foundUser = await this.userRepository.findOneBy({ phone });
    if (!foundUser) throw new BadRequestException('账号不存在');

    // 检查手机验证码是否正确
    const codeExist = await this.redis.exists(`login:code:${phone}`);
    if (!codeExist) throw new BadRequestException('请先获取手机验证码');

    // 对比手机验证码是否正确
    const codeRes = (await this.redis.get(`login:code:${phone}`))!.split(
      '_',
    )[1];
    if (codeRes !== sendCode) throw new BadRequestException('验证码错误');

    return {
      data: this.jwtService.sign({ id: foundUser.id }),
      msg: '登录成功',
    };
  }
}
