import type { AdminPermission } from "@codigo/schema";
import { resolveAdminPermissions } from "@codigo/schema";
import { useAuth } from "@/shared/auth/AuthProvider";

export function useAdminAccess() {
  const { isAdmin, user } = useAuth();
  const permissions = user
    ? resolveAdminPermissions(user.global_role, user.admin_permissions)
    : [];

  return {
    hasAdminPermission(permission: AdminPermission) {
      return permissions.includes(permission);
    },
    isAdmin,
    permissions,
  };
}
