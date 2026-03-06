import type { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { RedisOptions } from 'ioredis';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mysql',
  host: '192.168.231.128',
  port: 13306,
  username: 'root',
  password: '123456',
  database: 'codigo_lowcode',
  entities: ['dist/**/*.entityf.ts,.js}'],
  autoLoadEntities: true,
  synchronize: true,
};

export const redisConfig: RedisOptions = {
  host: '192.168.231.128',
  port: 6379,
};
