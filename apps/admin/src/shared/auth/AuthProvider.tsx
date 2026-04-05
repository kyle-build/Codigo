import type { IUser, LoginWithPasswordRequest } from "@codigo/schema";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { clearAccessToken, getAccessToken, setAccessToken } from "@/shared/auth/token";
import { fetchCurrentUser, loginWithPassword } from "@/modules/auth/api/auth";

interface AuthContextValue {
  isAdmin: boolean;
  loading: boolean;
  login: (payload: LoginWithPasswordRequest) => Promise<IUser>;
  logout: () => void;
  refreshUser: () => Promise<IUser | null>;
  token: string;
  user: IUser | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function isAdminRole(user: IUser | null) {
  return user?.global_role === "ADMIN" || user?.global_role === "SUPER_ADMIN";
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState(() => getAccessToken());
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(Boolean(getAccessToken()));

  const logout = useCallback(() => {
    clearAccessToken();
    setToken("");
    setUser(null);
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    const currentToken = getAccessToken();
    if (!currentToken) {
      setUser(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      const nextUser = await fetchCurrentUser();
      if (!isAdminRole(nextUser)) {
        logout();
        throw new Error("当前账号没有后台权限");
      }
      setToken(currentToken);
      setUser(nextUser);
      return nextUser;
    } catch (error) {
      logout();
      throw error;
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    if (!getAccessToken()) {
      setLoading(false);
      return;
    }

    void refreshUser().catch(() => undefined);
  }, [refreshUser]);

  const login = useCallback(
    async (payload: LoginWithPasswordRequest) => {
      const response = await loginWithPassword(payload);
      const nextToken = response.data.startsWith("Bearer ")
        ? response.data
        : `Bearer ${response.data}`;
      setAccessToken(nextToken);
      setToken(nextToken);
      const nextUser = await refreshUser();
      if (!nextUser) {
        throw new Error("获取后台账号失败");
      }
      return nextUser;
    },
    [refreshUser],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      isAdmin: isAdminRole(user),
      loading,
      login,
      logout,
      refreshUser,
      token,
      user,
    }),
    [loading, login, logout, refreshUser, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth 必须在 AuthProvider 中使用");
  }
  return context;
}
