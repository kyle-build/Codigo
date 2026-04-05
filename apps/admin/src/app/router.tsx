import { createHashRouter } from "react-router-dom";
import { AdminIndexRedirect } from "@/modules/admin/components/AdminIndexRedirect";
import AdminLayout from "@/modules/admin/components/AdminLayout";
import { AdminPermissionRoute } from "@/modules/admin/components/AdminPermissionRoute";
import { AdminRouteGuard } from "@/modules/admin/components/AdminRouteGuard";
import AdminComponents from "@/modules/admin/pages/components";
import AdminPages from "@/modules/admin/pages/pages";
import AdminPermissions from "@/modules/admin/pages/permissions";
import AdminUsers from "@/modules/admin/pages/users";
import LoginPage from "@/modules/auth/pages/LoginPage";

export const router = createHashRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: (
      <AdminRouteGuard>
        <AdminLayout />
      </AdminRouteGuard>
    ),
    children: [
      {
        index: true,
        element: <AdminIndexRedirect />,
      },
      {
        path: "users",
        element: (
          <AdminPermissionRoute permission="USER_MANAGE">
            <AdminUsers />
          </AdminPermissionRoute>
        ),
      },
      {
        path: "permissions",
        element: (
          <AdminPermissionRoute permission="PERMISSION_ASSIGN">
            <AdminPermissions />
          </AdminPermissionRoute>
        ),
      },
      {
        path: "pages",
        element: (
          <AdminPermissionRoute permission="PAGE_MANAGE">
            <AdminPages />
          </AdminPermissionRoute>
        ),
      },
      {
        path: "components",
        element: (
          <AdminPermissionRoute permission="COMPONENT_MANAGE">
            <AdminComponents />
          </AdminPermissionRoute>
        ),
      },
    ],
  },
]);
