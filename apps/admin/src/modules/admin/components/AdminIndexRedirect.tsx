import { Navigate } from "react-router-dom";
import { useAuth } from "@/shared/auth/AuthProvider";
import { resolveAdminDefaultRoute } from "@/modules/admin/config/navigation";
import { useAdminAccess } from "@/modules/admin/hooks/useAdminAccess";
import { AdminLoadingState } from "@/modules/admin/components/AdminLoadingState";

export function AdminIndexRedirect() {
  const { hasAdminPermission } = useAdminAccess();
  const { user } = useAuth();

  if (!user) {
    return <AdminLoadingState />;
  }

  return <Navigate to={resolveAdminDefaultRoute(hasAdminPermission)} replace />;
}
