import { IsString, IsNotEmpty } from 'class-validator';

// 基于类型验证的 DTO 类，用于处理验证码相关的请求数据
export class CaptchaDto {
  @IsNotEmpty({ message: 'type限制不为空!' })
  @IsString({ message: 'type限制为string类型!' })
  type: string;
}
