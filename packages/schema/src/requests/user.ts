import type { IUser } from "../models/user";

/**
 * 描述获取验证码接口的请求参数。
 */
export interface CaptchaRequest {
  type: "register" | "login";
}

/**
 * 描述注册接口的请求参数。
 */
export type RegisterRequest = Pick<IUser, "phone" | "password"> & {
  sendCode: string;
};

/**
 * 描述注册表单在前端校验时使用的字段结构。
 */
export type RegisterRequestFormValue = RegisterRequest & {
  confirm: string;
};

/**
 * 描述发送短信验证码接口的请求参数。
 */
export type SendCodeRequest = Pick<IUser, "phone"> & {
  captcha?: string;
} & CaptchaRequest;

/**
 * 描述账号密码登录接口的请求参数。
 */
export type LoginWithPasswordRequest = Pick<IUser, "phone" | "password">;

/**
 * 描述手机验证码登录接口的请求参数。
 */
export type LoginWithPhoneRequest = Pick<IUser, "phone"> & { sendCode: string };

/**
 * 描述更新个人资料接口的请求参数。
 */
export type UpdateProfileRequest = Partial<
  Pick<IUser, "username" | "head_img">
>;

/**
 * 描述修改密码接口的请求参数。
 */
export type ChangePasswordRequest = {
  oldPassword?: string;
  newPassword: string;
};
