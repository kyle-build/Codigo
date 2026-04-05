import axios from "axios";
import { message } from "antd";
import type { AxiosRequestConfig } from "axios";
import { clearAccessToken, getAccessToken } from "@/shared/auth/token";

export const BASE_URL = import.meta.env.VITE_BASE_URL;

const request = axios.create({
  baseURL: `${BASE_URL}/api`,
});

request.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    const data = response?.data;
    if (data.code === 0 && data.msg !== undefined) {
      message.success(data.msg);
    }
    return response;
  },
  (error) => {
    const { code, response } = error;
    if (code === "ERR_BAD_REQUEST") {
      message.warning(response?.data?.msg ?? "出现未知错误");
    } else if (response?.status === 401) {
      clearAccessToken();
      message.error(response?.data?.msg ?? "请先登录");
    }
    return Promise.reject(error);
  },
);

export default async function makeRequest<T = unknown>(
  url: string,
  options?: AxiosRequestConfig,
): Promise<T> {
  return (await request({ url, ...options })).data as T;
}
