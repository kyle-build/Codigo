import { useStoreAuth } from "@/shared/hooks/useStoreAuth";
import { useNavigate } from "react-router-dom";
import { useRequest } from "ahooks";
import { getLoginWithPassword } from "@/modules/auth/api/user";

export function useLogin() {
  const { login } = useStoreAuth();
  const nav = useNavigate();

  return useRequest(getLoginWithPassword, {
    manual: true,
    onSuccess: ({ data }) => {
      login(data);
      nav("/editor");
    },
  });
}












