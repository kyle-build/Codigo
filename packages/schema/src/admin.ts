export const ALL_ADMIN_PERMISSIONS = [
  "USER_MANAGE",
  "PERMISSION_ASSIGN",
  "PAGE_MANAGE",
  "COMPONENT_MANAGE",
] as const;

export type AdminPermission = (typeof ALL_ADMIN_PERMISSIONS)[number];

type AdminPermissionRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export const DEFAULT_ADMIN_PERMISSIONS: AdminPermission[] = [
  "USER_MANAGE",
  "PAGE_MANAGE",
  "COMPONENT_MANAGE",
];

export const ADMIN_PERMISSION_LABELS: Record<AdminPermission, string> = {
  USER_MANAGE: "用户管理",
  PERMISSION_ASSIGN: "权限分配",
  PAGE_MANAGE: "页面管理",
  COMPONENT_MANAGE: "组件管理",
};

export const ADMIN_PERMISSION_DESCRIPTIONS: Record<AdminPermission, string> = {
  USER_MANAGE: "查看用户、冻结账号",
  PERMISSION_ASSIGN: "修改角色、配置后台权限",
  PAGE_MANAGE: "查看页面、查看版本、删除页面",
  COMPONENT_MANAGE: "查看组件实例、删除组件实例",
};

export function resolveAdminPermissions(
  globalRole: AdminPermissionRole,
  adminPermissions?: AdminPermission[] | null,
) {
  if (globalRole === "SUPER_ADMIN") {
    return [...ALL_ADMIN_PERMISSIONS];
  }

  if (globalRole === "ADMIN") {
    if (Array.isArray(adminPermissions)) {
      return adminPermissions.filter((permission, index, source) => {
        return (
          ALL_ADMIN_PERMISSIONS.includes(permission) &&
          source.indexOf(permission) === index
        );
      });
    }

    return [...DEFAULT_ADMIN_PERMISSIONS];
  }

  return [];
}
