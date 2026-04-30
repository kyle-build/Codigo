import { useEffect } from "react";
import { message, Spin } from "antd";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useStoreAuth } from "@/shared/hooks";

type EditorRouteGuardProps = {
  children: React.ReactNode;
};

function EditorRouteGuard({ children }: EditorRouteGuardProps) {
  const { store: storeAuth, fetchUserInfo } = useStoreAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!storeAuth.token) {
      message.info("访客仅可查看已发布页面和模板内容");
      navigate("/app-management?tab=published", { replace: true });
      return;
    }

    if (!storeAuth.details) {
      fetchUserInfo().then((res) => {
        if (!res) {
          navigate("/app-management?tab=published", { replace: true });
        }
      });
    }
  }, [fetchUserInfo, navigate, storeAuth.details, storeAuth.token]);

  if (!storeAuth.token || !storeAuth.details) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return <>{children}</>;
}

const EditorRouteGuardComponent = observer(EditorRouteGuard);

export { EditorRouteGuardComponent as EditorRouteGuard };
