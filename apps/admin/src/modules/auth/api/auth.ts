import type { IUser, LoginWithPasswordRequest } from "@codigo/schema";
import request from "@/shared/api/request";

interface AuthTokenResponse {
  data: string;
}

interface CurrentUserResponse {
  data: IUser;
}

export function loginWithPassword(data: LoginWithPasswordRequest) {
  return request<AuthTokenResponse>("/auth/tokens/password", {
    data,
    method: "POST",
  });
}

export async function fetchCurrentUser() {
  const response = await request<CurrentUserResponse>("/user/me");
  return response.data;
}
