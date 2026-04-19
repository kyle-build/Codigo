import { useSendCode } from "@/shared/hooks";
import type { FormInstance } from "antd";
import { useStoreAuth } from "@/shared/hooks/useStoreAuth";
import { useRequest } from "ahooks";
import { getRegister } from "@/modules/auth/api/user";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resolveSafeRedirect } from "@/modules/auth/utils/redirect";

export function useRegister(form: FormInstance) {
  const { login } = useStoreAuth();
  const { refreshCaptcha } = useSendCode(form, "register");
  const nav = useNavigate();
  const [searchParams] = useSearchParams();

  return useRequest(getRegister, {
    manual: true,
    onSuccess: async (res) => {
      await login(res.data);
      const redirect = resolveSafeRedirect(searchParams.get("redirect"));
      nav(redirect ?? "/");
    },
    onFinally: () => {
      refreshCaptcha();
    },
  });
}







