import type { AdminPermission, GlobalRole, IUser } from "@codigo/schema";
import request from "@/shared/api/request";
import type {
  AdminComponentItem,
  AdminComponentQuery,
  AdminComponentStat,
  AdminListResponse,
  AdminPageItem,
  AdminPageQuery,
  AdminPageVersionItem,
  AdminUserStatus,
} from "@/modules/admin/types/admin";

export const ADMIN_PAGE_SIZE = 10;

function resolveListResult<T>(response: AdminListResponse<T>) {
  return {
    list: response.data?.list ?? response.list ?? [],
    total: response.data?.total ?? response.total ?? 0,
  };
}

export async function fetchAdminUsers(params: AdminPageQuery = {}) {
  const response = await request<AdminListResponse<IUser>>("/admin/users", {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? ADMIN_PAGE_SIZE,
      search: params.search,
    },
  });

  return resolveListResult(response);
}

export async function updateAdminUserRole(userId: number, role: GlobalRole) {
  await request(`/admin/users/${userId}/role`, {
    method: "PUT",
    data: { role },
  });
}

export async function updateAdminUserStatus(
  userId: number,
  status: AdminUserStatus,
) {
  await request(`/admin/users/${userId}/status`, {
    method: "PUT",
    data: { status },
  });
}

export async function updateAdminUserPermissions(
  userId: number,
  permissions: AdminPermission[],
) {
  await request(`/admin/users/${userId}/permissions`, {
    method: "PUT",
    data: { permissions },
  });
}

export async function fetchAdminPages(params: AdminPageQuery = {}) {
  const response = await request<AdminListResponse<AdminPageItem>>(
    "/admin/pages",
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? ADMIN_PAGE_SIZE,
        search: params.search,
      },
    },
  );

  return resolveListResult(response);
}

export async function fetchAdminPageVersions(pageId: number) {
  const response = await request<{ data?: AdminPageVersionItem[] }>(
    `/admin/pages/${pageId}/versions`,
  );

  return response.data ?? [];
}

export async function deleteAdminPage(pageId: number) {
  await request(`/admin/pages/${pageId}`, {
    method: "DELETE",
  });
}

export async function fetchAdminComponentStats(search = "") {
  const response = await request<{ data?: AdminComponentStat[] }>(
    "/admin/components/stats",
    {
      params: { search },
    },
  );

  return response.data ?? [];
}

export async function fetchAdminComponents(params: AdminComponentQuery = {}) {
  const response = await request<AdminListResponse<AdminComponentItem>>(
    "/admin/components",
    {
      params: {
        page: params.page ?? 1,
        limit: params.limit ?? ADMIN_PAGE_SIZE,
        search: params.search,
        type: params.type,
      },
    },
  );

  return resolveListResult(response);
}

export async function deleteAdminComponent(componentId: number) {
  await request(`/admin/components/${componentId}`, {
    method: "DELETE",
  });
}
