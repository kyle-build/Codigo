import { Injectable } from '@nestjs/common';

/**
 * @description: 生成随机验证码、随机图像和随机昵称的工具类
 * randomCode 方法生成一个 1000 到 9999 之间的随机整数，作为验证码使用
 * randomImage 方法返回一个随机图像的 URL，作为用户头像使用（目前为占位图像）
 * randomNickName 方法生成一个随机昵称，由一个形容词和一个名词组合而成，例如 "快乐的小猫"、"聪明的小狗" 等
 * 这些方法可以在用户注册、登录等场景中使用，提供随机的验证码、头像和昵称，增强用户体验和安全性
 */
@Injectable()
export class RandomTool {
  randomCode(): number {
    return Math.floor(Math.random() * (9999 - 1000)) + 1000;
  }

  // to-do: 生成随机图像
  randomImage() {
    return 'https://c-ssl.dtstatic.com/uploads/item/202003/18/20200318091411_bopif.thumb.400_0.jpg';
  }

  // 生成随机昵称
  randomNickName(): string {
    const adjectives = ['快乐的', '聪明的', '勇敢的', '善良的'];
    const nouns = ['小猫', '小狗', '小熊', '小兔'];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adjective}${noun}`;
  }
}
