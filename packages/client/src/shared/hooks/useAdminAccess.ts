import type { AdminPermission } from "@codigo/schema";
import { resolveAdminPermissions } from "@codigo/schema";
import { useStoreAuth } from "./useStoreAuth";

export function useAdminAccess() {
  const { store: storeAuth } = useStoreAuth();
  const details = storeAuth.details;
  const permissions = details
    ? resolveAdminPermissions(details.global_role, details.admin_permissions)
    : [];

  return {
    isAdmin:
      details?.global_role === "ADMIN" || details?.global_role === "SUPER_ADMIN",
    permissions,
    hasAdminPermission(permission: AdminPermission) {
      return permissions.includes(permission);
    },
  };
}
