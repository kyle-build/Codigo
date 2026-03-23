import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { StrategyOptions } from 'passport-jwt';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { jwtConfig } from 'config';
import { User } from '../user/entities/user.entity';

/**
 * JWT 策略类，负责验证 JWT 令牌的有效性
 * @description 该类通过继承 PassportStrategy，并使用 passport-jwt 库来实现 JWT 令牌的验证逻辑。在 validate 方法中，验证令牌的有效性，并根据令牌中的用户 ID 从数据库中获取用户信息。如果令牌无效或用户不存在，则抛出 UnauthorizedException 异常；如果验证成功，则返回用户信息（不包含密码）
 * @throws UnauthorizedException 当令牌无效或用户不存在时抛出异常
 * @returns 用户信息（不包含密码）
 */
@Injectable()
export class JWTstrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {
    // to-do: 这里的 secretOrKey 和 jwtFromRequest 可以根据实际需求进行调整
    super({
      secretOrKey: jwtConfig.secret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    } as StrategyOptions);
  }
  /**
   * 验证令牌是否有效
   * @returns 当令牌有效时，返回当前用户的属性集合（除密码之外）
   * @throws 当令牌无效时，抛出异常
   */
  async validate(data: { id: number; iat: number; exp: number }) {
    if (!data) throw new UnauthorizedException('请先登录');

    if (data.exp - data.iat <= 0)
      throw new UnauthorizedException('登录已过期，请重新登陆');

    const user = await this.userRepository.findOne({ where: { id: data.id } });
    if (!user) throw new UnauthorizedException('出现错误，请重新登录');

    return { ...user, password: '' };
  }
}
