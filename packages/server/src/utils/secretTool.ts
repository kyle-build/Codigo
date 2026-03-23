import { createHash } from 'node:crypto';
import { Injectable } from '@nestjs/common';

// to-do: 可以考虑添加其他加密算法，如SHA256等
/**
 * @description: 对字符串进行MD5加密的工具类
 * getSecret 方法接受一个字符串参数，并返回该字符串的 MD5 加密结果。该方法使用 Node.js 内置的 crypto 模块，通过 createHash 方法创建一个 MD5 哈希对象，然后使用 update 方法将输入字符串传递给哈希对象，最后调用 digest 方法以十六进制格式返回加密后的字符串
 * @param {string} str - 要加密的字符串
 * @return {string} 加密后的字符串
 */
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
