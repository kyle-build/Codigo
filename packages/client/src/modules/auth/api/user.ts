import request from "@/shared/utils/request";
import type {
  SendCodeRequest,
  RegisterRequest,
  LoginWithPasswordRequest,
  LoginWithPhoneRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "@codigo/materials-react";

// 图形验证码接口
export async function getCaptcha(data: { type: string }) {
  return request("/auth/captcha", {
    params: data,
    method: "GET",
  });
}

// 手机验证码接口
export async function sendCode(data: SendCodeRequest) {
  return request("/auth/sms-codes", {
    data,
    method: "POST",
  });
}

// 注册接口
export async function getRegister(data: RegisterRequest) {
  return request("/users", {
    data,
    method: "POST",
  });
}

/**
 * 账号密码登录
 */
export async function getLoginWithPassword(data: LoginWithPasswordRequest) {
  return request("/auth/tokens/password", {
    data,
    method: "POST",
  });
}

/**
 * 验证码登录
 */
export async function getLoginWithPhone(data: LoginWithPhoneRequest) {
  return request("/auth/tokens/phone", {
    data,
    method: "POST",
  });
}

/**
 * 更新个人信息
 */
export async function updateProfile(data: UpdateProfileRequest) {
  return request("/users/me", {
    data,
    method: "PATCH",
  });
}

/**
 * 修改密码
 */
export async function updatePassword(data: ChangePasswordRequest) {
  return request("/users/me/password", {
    data,
    method: "PUT",
  });
}
