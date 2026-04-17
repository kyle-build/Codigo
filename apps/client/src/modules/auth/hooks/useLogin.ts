import { useStoreAuth } from "@/shared/hooks/useStoreAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRequest } from "ahooks";
import { getLoginWithPassword } from "@/modules/auth/api/user";
import { resolveSafeRedirect } from "@/modules/auth/utils/redirect";

export function useLogin() {
  const { login } = useStoreAuth();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  return useRequest(getLoginWithPassword, {
    manual: true,
    onSuccess: async (res) => {
      await login(res.data);
      const redirect = resolveSafeRedirect(searchParams.get("redirect"));
      nav(redirect ?? "/?tab=developing");
    },
  });
}










