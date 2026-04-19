import type { DynamicModule, Provider } from '@nestjs/common';
import { Module } from '@nestjs/common';
import Redis from 'ioredis';
import type { RedisOptions } from 'ioredis';
/**
 * Redis 模块，提供 Redis 相关的功能
 * @description 该模块通过封装 ioredis 库，提供了 Redis 的基本操作方法，如设置、获取和删除键值对，以及一个用于缓存数据的高级方法 getCachedData。通过 forRoot 方法可以全局注册该模块，并传入 Redis 的配置选项
 *
 */
@Module({})
export class RedisModule {
  private redis: Redis;

  constructor(options: RedisOptions) {
    this.redis = new Redis(options);
  }

  /**
   * root 方法用于全局注册 Redis 模块，并传入 Redis 的配置选项
   * @param options Redis 配置选项，包括主机、端口、密码等
   * @returns 动态模块实例
   */
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

  async set(key: string, value: string, time?: number) {
    if (time) {
      await this.redis.set(key, value, 'EX', time);
      return;
    }

    await this.redis.set(key, value);
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  async get(key: string) {
    const value = await this.redis.get(key);
    return value ? value.toString() : null;
  }

  async exists(key: string) {
    const result = await this.redis.exists(key);
    return result;
  }

  /**
   * 原子自增 key，并返回自增后的数值。
   */
  async incr(key: string) {
    return this.redis.incr(key);
  }

  /**
   * 为 key 设置过期时间（秒）。
   */
  async expire(key: string, time: number) {
    await this.redis.expire(key, time);
  }

  async getCachedData<T = any>(
    key: string,
    fetchFunction: () => Promise<T>,
    options?: {
      ttl?: number;
      force?: boolean;
    },
  ): Promise<T> {
    let cachedData = await this.redis.get(key);

    if (options?.force) {
      cachedData = null;
    }

    if (!cachedData) {
      const data = await fetchFunction();
      await this.redis.set(
        key,
        JSON.stringify(data),
        'EX',
        options?.ttl ?? 3600,
      );
      return data;
    } else {
      return JSON.parse(cachedData) as T;
    }
  }
}
