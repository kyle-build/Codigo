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
import AdminUsers from "@/modules/admin/pages/users";
import { AdminRouteGuard } from "@/modules/admin/components/AdminRouteGuard";
import Profile from "@/modules/profile";

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
    path: "/profile",
    element: <Profile />,
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
        element: <AdminUsers />,
      },
    ],
  },
]);
