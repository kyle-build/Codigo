import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';
// 该注解表示该类可以注入到其他类
// 该类提供了一个md5方法，用于对字符串进行MD5加密
// to-do: 可以考虑添加其他加密算法，如SHA256等
@Injectable()
export class SecretTool {
  /**
   * @description: 对字符串进行MD5加密
   * @param {string} str - 要加密的字符串
   * @return {string} 加密后的字符串
   */
  getSecret(str: string): string {
    return createHash('md5').update(str).digest('hex');
  }
}
