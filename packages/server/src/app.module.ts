import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { jwtConfig, redisConfig, typeOrmConfig } from '../config';
import { UserModule } from './user/user.module';
import { RedisModule } from './utils/modules/redis.module';
import { User } from './user/entities/user.entity';
import { LowCodeModule } from './low-code/low-code.module';
import { ResourcesModule } from './resources/resources.module';
import { JWTstrategy } from './utils/JwtStrategyTool';

/**
 * 应用程序模块，作为 NestJS 应用的根模块
 * @description 该模块导入了 TypeOrmModule 用于数据库连接和实体管理，JwtModule 用于 JWT 相关功能，UserModule 用于用户相关功能，以及 RedisModule 用于 Redis 相关功能。通过这些模块的导入，AppModule 将这些功能整合在一起，为整个应用提供支持
 * @imports TypeOrmModule.forRoot(typeOrmConfig) - 配置数据库连接和实体管理
 * @imports TypeOrmModule.forFeature([User]) - 注册 User 实体以供依赖注入
 * @imports UserModule - 导入用户模块，处理与用户相关的业务逻辑
 * @imports RedisModule.forRoot(redisConfig) - 导入 Redis 模块，并传入 Redis 的配置选项
 * @exports AppModule - 导出 AppModule 以供其他模块使用
 */
@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    { ...TypeOrmModule.forFeature([User]), global: true },
    UserModule,
    LowCodeModule,
    ResourcesModule,
    RedisModule.forRoot(redisConfig),
    JwtModule.register(jwtConfig),
  ],
  controllers: [],
  providers: [JWTstrategy],
})
export class AppModule {}
