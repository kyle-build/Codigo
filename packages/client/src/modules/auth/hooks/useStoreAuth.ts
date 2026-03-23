import { createStoreAuth } from "@/modules/auth/stores";
import { computed, action } from "mobx";

export const storeAuth = createStoreAuth();
export function useStoreAuth() {
  // 判断是否登录，创建可响应的计算属性的函数
  const isLogin = computed(() => !!storeAuth.token);

  // 登录
  const login = action(async (token: string) => {
    storeAuth.token = `Bearer ${token}`;
    localStorage.setItem("token", storeAuth.token);
  });
  return { login, isLogin };
}












