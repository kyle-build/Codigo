import { Navigate, createHashRouter } from "react-router-dom";
import Editor from "@/modules/editor";
import Home from "@/modules/home/index";
import DataCount from "@/modules/dataCount";
import Release from "@/modules/release";
import Preview from "@/modules/preview";
import LoginOrRegister from "@/modules/auth";
import Flow from "@/modules/flow";
import DevDoc from "@/modules/devDocument";
import AppManagement from "@/modules/appManagement/index";
import { StudioLayout } from "@/app/layouts/StudioLayout";
import { EditorRouteGuard } from "@/modules/editor/components/EditorRouteGuard";
import Profile from "@/modules/profile";
import AdminLayout from "@/modules/adminConsole/components/AdminLayout";
import { AdminRouteGuard } from "@/modules/adminConsole/components/AdminRouteGuard";
import AdminDashboard from "@/modules/adminConsole/pages/Dashboard";
import AdminPlaceholder from "@/modules/adminConsole/pages/Placeholder";

export const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/home",
    element: <Navigate to="/" replace />,
  },
  {
    path: "/doc",
    element: <DevDoc />,
  },
  {
    path: "/app-management",
    element: <AppManagement />,
  },
  {
    path: "/login",
    element: <LoginOrRegister />,
  },
  {
    path: "/dataCount",
    element: <Navigate to="/console/metrics" replace />,
  },
  {
    path: "/profile",
    element: <Profile />,
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
    path: "/release/:id",
    element: <Release />,
  },
  {
    element: <StudioLayout />,
    children: [
      {
        path: "/editor",
        element: (
          <EditorRouteGuard>
            <Editor />
          </EditorRouteGuard>
        ),
      },
      {
        path: "/flow",
        element: <Flow />,
      },
    ],
  },
  {
    path: "/console",
    element: (
      <AdminRouteGuard>
        <AdminLayout />
      </AdminRouteGuard>
    ),
    children: [
      { index: true, element: <AdminDashboard /> },
      { path: "settings", element: <AdminPlaceholder title="基础设置" /> },
      { path: "permissions", element: <AdminPlaceholder title="权限设置" /> },
      { path: "roles", element: <AdminPlaceholder title="角色管理" /> },
      { path: "versions", element: <AdminPlaceholder title="版本管理" /> },
      { path: "snippets", element: <AdminPlaceholder title="代码片段管理" /> },
      { path: "big-screen", element: <AdminPlaceholder title="数据大屏" /> },
      { path: "metrics", element: <DataCount /> },
    ],
  },
  {
    path: "/admin/*",
    element: <Navigate to="/console" replace />,
  },
]);
