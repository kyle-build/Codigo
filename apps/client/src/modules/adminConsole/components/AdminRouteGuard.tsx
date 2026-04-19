import { useEffect } from "react";
import { message, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useLocation, useNavigate } from "react-router-dom";
import { useStoreAuth } from "@/shared/hooks";

/** 页面管理工作台路由守卫：要求登录，必要时拉取用户信息。 */
export const AdminRouteGuard = observer(
  ({ children }: { children: React.ReactNode }) => {
    const { store: storeAuth, fetchUserInfo } = useStoreAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
      if (!storeAuth.token) {
        message.info("请先登录");
        const redirect = encodeURIComponent(
          `${location.pathname}${location.search}`,
        );
        navigate(`/?modal=login&redirect=${redirect}`, { replace: true });
        return;
      }

      if (!storeAuth.details) {
        fetchUserInfo().then((res) => {
          if (!res) {
            const redirect = encodeURIComponent(
              `${location.pathname}${location.search}`,
            );
            navigate(`/?modal=login&redirect=${redirect}`, { replace: true });
          }
        });
      }
    }, [
      fetchUserInfo,
      location.pathname,
      location.search,
      navigate,
      storeAuth.details,
      storeAuth.token,
    ]);

    if (!storeAuth.token || !storeAuth.details) {
      return (
        <div className="flex h-screen items-center justify-center">
          <Spin size="large" />
        </div>
      );
    }

    return <>{children}</>;
  },
);
