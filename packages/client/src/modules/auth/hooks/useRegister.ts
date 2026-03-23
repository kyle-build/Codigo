import { useSendCode } from "@/shared/hooks";
import type { FormInstance } from "antd";
import { useStoreAuth } from "@/shared/hooks/useStoreAuth";
import { useRequest } from "ahooks";
import { getRegister } from "@/modules/auth/api/user";
export function useRegister(form: FormInstance) {
  const { login } = useStoreAuth();
  const { refreshCaptcha } = useSendCode(form, "register");

  return useRequest(getRegister, {
    manual: true,
    onSuccess: ({ data }) => {
      login(data);
    },
    onFinally: () => {
      refreshCaptcha();
    },
  });
}












