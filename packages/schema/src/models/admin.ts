/**
 * 定义后台管理端支持的全部权限标识。
 */
export const ALL_ADMIN_PERMISSIONS = [
  "USER_MANAGE",
  "PERMISSION_ASSIGN",
  "PAGE_MANAGE",
  "COMPONENT_MANAGE",
] as const;

/**
 * 表示单个后台管理权限值。
 */
export type AdminPermission = (typeof ALL_ADMIN_PERMISSIONS)[number];

/**
 * 表示具备后台权限解析能力的全局角色范围。
 */
type AdminPermissionRole = "SUPER_ADMIN" | "ADMIN" | "USER";

/**
 * 定义普通管理员默认拥有的权限集合。
 */
export const DEFAULT_ADMIN_PERMISSIONS: AdminPermission[] = [
  "USER_MANAGE",
  "PAGE_MANAGE",
  "COMPONENT_MANAGE",
];

/**
 * 定义后台权限在界面中的展示名称。
 */
export const ADMIN_PERMISSION_LABELS: Record<AdminPermission, string> = {
  USER_MANAGE: "用户管理",
  PERMISSION_ASSIGN: "权限分配",
  PAGE_MANAGE: "页面管理",
  COMPONENT_MANAGE: "组件管理",
};

/**
 * 定义后台权限在界面中的说明文案。
 */
export const ADMIN_PERMISSION_DESCRIPTIONS: Record<AdminPermission, string> = {
  USER_MANAGE: "查看用户、冻结账号",
  PERMISSION_ASSIGN: "修改角色、配置后台权限",
  PAGE_MANAGE: "查看页面、查看版本、删除页面",
  COMPONENT_MANAGE: "查看组件实例、删除组件实例",
};

/**
 * 根据用户全局角色和显式权限列表，解析其最终可用的后台权限。
 */
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
