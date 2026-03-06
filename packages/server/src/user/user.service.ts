import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SecretTool } from 'src/utils/secretTool';
import { RedisModule } from 'src/utils/modules/redis.module';
import { CaptchaTool } from 'src/utils/captchaTool';

@Injectable()
export class UserService {
  constructor(
    private readonly redisModule: RedisModule,
    private readonly captchaTool: CaptchaTool,
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
}
