import type { AdminPermission } from "@codigo/schema";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/shared/auth/AuthProvider";
import { resolveAdminDefaultRoute } from "@/modules/admin/config/navigation";
import { useAdminAccess } from "@/modules/admin/hooks/useAdminAccess";
import { AdminLoadingState } from "@/modules/admin/components/AdminLoadingState";

interface AdminPermissionRouteProps {
  children: React.ReactNode;
  permission: AdminPermission;
}

export function AdminPermissionRoute({
  children,
  permission,
}: AdminPermissionRouteProps) {
  const { hasAdminPermission, isAdmin } = useAdminAccess();
  const { user } = useAuth();

  if (!user) {
    return <AdminLoadingState />;
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAdminPermission(permission)) {
    return <Navigate to={resolveAdminDefaultRoute(hasAdminPermission)} replace />;
  }

  return <>{children}</>;
}
