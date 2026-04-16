import axios from "axios";
import type { AxiosRequestConfig } from "axios";
import { storeAuth } from "../hooks/useStoreAuth";
import { message } from "antd";
export const BASE_URL = import.meta.env.VITE_BASE_URL || "";
const request = axios.create({ baseURL: BASE_URL + "/api" });

// 请求拦截器
request.interceptors.request.use((config) => {
  if (storeAuth.token) {
    config.headers.Authorization = storeAuth.token;
  }
  return config;
});

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    const data = response?.data;
    if (data.code === 0 && data.msg !== undefined) {
      message.success(data.msg);
    }
    return response;
  },
  (err) => {
    const { code, response } = err;
    if (code === "ERR_BAD_REQUEST") {
      message.warning(response?.data?.msg ?? "出现未知错误");
    } else if (response?.status === 401) {
      message.error(response?.data?.msg ?? "请先登录");
    }
    return Promise.reject(err);
  },
);

export default async function makeRequest<T = any>(
  url: string,
  options?: AxiosRequestConfig,
): Promise<T> {
  return (await request({ url, ...options }))?.data as T;
}
