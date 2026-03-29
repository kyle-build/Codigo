import type { AdminPermission } from "@codigo/schema";
import { Spin } from "antd";
import { observer } from "mobx-react-lite";
import { Navigate } from "react-router-dom";
import { useAdminAccess, useStoreAuth } from "@/shared/hooks";

interface AdminPermissionRouteProps {
  permission: AdminPermission;
  children: React.ReactNode;
}

export const AdminPermissionRoute = observer(
  ({ permission, children }: AdminPermissionRouteProps) => {
    const { store: storeAuth } = useStoreAuth();
    const { hasAdminPermission } = useAdminAccess();

    if (!storeAuth.details) {
      return (
        <div className="flex h-screen items-center justify-center">
          <Spin size="large" />
        </div>
      );
    }

    if (!hasAdminPermission(permission)) {
      return <Navigate to="/admin" replace />;
    }

    return <>{children}</>;
  },
);
