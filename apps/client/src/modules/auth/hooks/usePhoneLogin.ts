import { useStoreAuth } from "@/shared/hooks/useStoreAuth";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useRequest } from "ahooks";
import { getLoginWithPhone } from "@/modules/auth/api/user";
import { resolveSafeRedirect } from "@/modules/auth/utils/redirect";

export function usePhoneLogin() {
  const { login } = useStoreAuth();
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  return useRequest(getLoginWithPhone, {
    manual: true,
    onSuccess: async (res) => {
      await login(res.data);
      const redirect = resolveSafeRedirect(searchParams.get("redirect"));
      nav(redirect ?? "/admin");
    },
  });
}









