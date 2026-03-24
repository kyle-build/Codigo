import { createStoreAuth } from "../stores";
import { computed, action } from "mobx";
import request from "../utils/request";

export const storeAuth = createStoreAuth();
export function useStoreAuth() {
  // 判断是否登录，创建可响应的计算属性的函数
  const isLogin = computed(() => !!storeAuth.token);

  // 登录
  const login = action(async (token: string) => {
    storeAuth.token = `Bearer ${token}`;
    localStorage.setItem("token", storeAuth.token);
    await fetchUserInfo();
  });

  const logout = action(() => {
    storeAuth.token = "";
    storeAuth.details = null;
    localStorage.removeItem("token");
  });

  const fetchUserInfo = action(async () => {
    if (!storeAuth.token) return;
    try {
      const { data } = await request("/user/me");
      storeAuth.details = data;
    } catch (e) {
      console.error("获取用户信息失败", e);
    }
  });

  return { login, logout, isLogin, fetchUserInfo, store: storeAuth };
}












