const TOKEN_KEY = "token";

export function getAccessToken() {
  return localStorage.getItem(TOKEN_KEY) ?? "";
}

export function setAccessToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken() {
  localStorage.removeItem(TOKEN_KEY);
}
