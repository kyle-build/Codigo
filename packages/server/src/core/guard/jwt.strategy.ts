import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { StrategyOptions } from 'passport-jwt';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { jwtConfig } from 'src/config';
import { User } from 'src/modules/user/entity/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    super({
      secretOrKey: jwtConfig.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    } as StrategyOptions);
  }

  async validate(data: { id: number; iat: number; exp: number }) {
    if (!data) throw new UnauthorizedException('请先登录');

    if (data.exp - data.iat <= 0)
      throw new UnauthorizedException('登录已过期，请重新登录');

    const user = await this.userRepository.findOne({ where: { id: data.id } });
    if (!user) throw new UnauthorizedException('出现错误，请重新登录');
    if (user.status === 'frozen') {
      throw new UnauthorizedException('账号已被冻结，请联系管理员');
    }

    return { ...user, password: '' };
  }
}
