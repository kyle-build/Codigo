import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { useStoreAuth } from "@/shared/hooks";
import { Spin } from "antd";

export const AdminRouteGuard = observer(({ children }: { children: React.ReactNode }) => {
  const { store: storeAuth, fetchUserInfo } = useStoreAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!storeAuth.token) {
      nav("/login", { replace: true });
      return;
    }

    if (!storeAuth.details) {
      fetchUserInfo().then((res) => {
        if (!res) {
          nav("/login", { replace: true });
        } else if (res.global_role !== "ADMIN" && res.global_role !== "SUPER_ADMIN") {
          nav("/", { replace: true });
        }
      });
    } else if (
      storeAuth.details.global_role !== "ADMIN" &&
      storeAuth.details.global_role !== "SUPER_ADMIN"
    ) {
      nav("/", { replace: true });
    }
  }, [storeAuth.token, storeAuth.details, nav, fetchUserInfo]);

  if (!storeAuth.details) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
});
