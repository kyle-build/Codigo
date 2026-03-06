import type { DynamicModule, Provider } from '@nestjs/common';
import { Module } from '@nestjs/common';
import Redis from 'ioredis';
import type { RedisOptions } from 'ioredis';
@Module({})
export class RedisModule {
  private redis: Redis;

  constructor(options: RedisOptions) {
    this.redis = new Redis(options);
  }
  static forRoot(options: RedisOptions): DynamicModule {
    const providers: Provider[] = [
      {
        provide: RedisModule,
        useValue: new RedisModule(options),
      },
    ];
    return {
      providers,
      global: true,
      exports: providers,
      module: RedisModule,
    };
  }

  set(key: string, value: string, time?: number) {
    time ? this.redis.set(key, value, 'EX', time) : this.redis.set(key, value);
  }

  // 删除 Redis 中的指定键
  del(key: string) {
    this.redis.del(key);
  }

  // 异步方法从 Redis 中获取指定键的值
  async get(key: string) {
    const value = await this.redis.get(key);
    return value ? value.toString() : null;
  }

  // 异步方法检查 Redis 中是否存在指定键
  async exists(key: string) {
    const result = await this.redis.exists(key);
    return result;
  }

  async getCachedData<T = any>(
    key: string,
    fetchFunction: () => Promise<T>,
    options?: {
      ttl?: number;
      force?: boolean;
    },
  ): Promise<T> {
    let data = await this.redis.get(key);

    if (options?.force) {
      // 设置强制刷新
      data = null;
    }

    if (!data) {
      // @ts-expect-error ignore this type
      data = await fetchFunction();
      await this.redis.set(
        key,
        JSON.stringify(data),
        'EX',
        options?.ttl ?? 3600,
      );
    } else {
      data = JSON.parse(data);
    }

    return data as T;
  }
}
