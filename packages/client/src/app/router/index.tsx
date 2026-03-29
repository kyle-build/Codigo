import { createHashRouter, Navigate } from "react-router-dom";
import Editor from "@/modules/editor";
import Home from "@/modules/home/index";
import DataCount from "@/modules/dataCount";
import Release from "@/modules/release";
import Preview from "@/modules/preview";
import LoginOrRegister from "@/modules/auth";
import Flow from "@/modules/flow";
import DevDoc from "@/modules/devDocument";
import TemplateSelect from "@/modules/home/components/TemplateSelect";
import { StudioLayout } from "@/app/layouts/StudioLayout";
import AdminLayout from "@/modules/admin/components/AdminLayout";
import { AdminPermissionRoute } from "@/modules/admin/components/AdminPermissionRoute";
import AdminComponents from "@/modules/admin/pages/components";
import AdminPages from "@/modules/admin/pages/pages";
import AdminUsers from "@/modules/admin/pages/users";
import { AdminRouteGuard } from "@/modules/admin/components/AdminRouteGuard";

export const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/doc",
    element: <DevDoc />,
  },
  {
    path: "/templates",
    element: <TemplateSelect />,
  },
  {
    path: "/login",
    element: <LoginOrRegister />,
  },
  {
    path: "/dataCount",
    element: <DataCount />,
  },
  {
    path: "/preview",
    element: <Preview />,
  },
  {
    path: "/release",
    element: <Release />,
  },
  {
    element: <StudioLayout />,
    children: [
      {
        path: "/editor",
        element: <Editor />,
      },
      {
        path: "/flow",
        element: <Flow />,
      },
    ],
  },
  {
    path: "/admin",
    element: (
      <AdminRouteGuard>
        <AdminLayout />
      </AdminRouteGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="users" replace />,
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
            <AdminUsers />
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
