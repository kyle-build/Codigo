import { useStoreAuth } from "@/shared/hooks/useStoreAuth";
import { useRequest } from "ahooks";
import { getLoginWithPhone } from "@/modules/auth/api/user";

export function usePhoneLogin() {
  const { login } = useStoreAuth();

  return useRequest(getLoginWithPhone, {
    manual: true,
    onSuccess: ({ data }) => {
      login(data);
    },
  });
}
