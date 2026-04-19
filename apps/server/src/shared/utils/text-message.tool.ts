import { Injectable } from '@nestjs/common';
import { TextMessageConfig } from 'src/config';

/**
 * 短信发送装饰器
 * @description 该类提供了一个 sendTextMessage 方法，用于向指定的手机号码发送包含随机验证码的短信。方法接受两个参数：phone（目标手机号码）和 randomCode（要发送的验证码）。方法内部构建了一个请求 URL，并使用 fetch API 发送 POST 请求到短信服务提供商的 API 端点，携带必要的查询参数和授权头。最后，方法返回 API 响应的 JSON 数据
 * @param {string} phone - 目标手机号码
 * @param {number} randomCode - 要发送的验证码
 * @return {Promise<any>} API 响应的 JSON 数据
 * @throws 可能会抛出网络错误或 API 错误，调用者需要处理这些异常
 */
@Injectable()
export class TextMessageTool {
  async sendTextMessage(
    phone: string,
    randomCode: number,
  ): Promise<{ code?: number; [key: string]: unknown }> {
    const url = new URL('https://jmsms.market.alicloudapi.com/sms/send');

    url.searchParams.append('mobile', phone);
    url.searchParams.append('templateId', 'JM1000372');
    url.searchParams.append('value', randomCode.toString());

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        Authorization: `APPCODE ${TextMessageConfig.AppCode}`,
      },
    });

    return (await response.json()) as { code?: number; [key: string]: unknown };
  }
}
