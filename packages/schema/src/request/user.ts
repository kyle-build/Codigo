import type { IUser } from "..";

// 验证码接口的参数类型
export interface CaptchaRequest {
  type: "register" | "login";
}

// 注册接口的参数类型
export type RegisterRequest = Pick<IUser, "phone" | "password"> & {
  sendCode: string;
};

// 前端表单验证参数类型
export type RegisterRequestFormValue = RegisterRequest & {
  confirm: string;
};

// 短信验证码接口的参数类型
export type SendCodeRequest = Pick<IUser, "phone"> & {
  captcha: string;
} & CaptchaRequest;

// 账号密码登录接口参数类型
export type LoginWithPasswordRequest = Pick<IUser, "phone" | "password">;

// 账号密码登录接口参数类型
export type LoginWithPhoneRequest = Pick<IUser, "phone"> & { sendCode: string };
