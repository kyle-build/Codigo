import { Injectable } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';

/**
 * @description: 生成验证码
 * @return {object} 包含验证码文本和SVG图像的对象
 */
@Injectable()
export class CaptchaTool {
  async generateCaptcha() {
    const captcha = svgCaptcha.create({
      size: 4,
      ignoreChars: '0o1i',
      noise: 2,
      color: true,
      background: '#cc9966',
    });
    return captcha;
  }
}
