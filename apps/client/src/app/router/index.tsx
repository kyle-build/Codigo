import { createHashRouter } from "react-router-dom";
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
import { AdminPortalRedirect } from "@/app/router/AdminPortalRedirect";
import { EditorRouteGuard } from "@/modules/editor/components/EditorRouteGuard";
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
    path: "/app-management",
    element: <AppManagement />,
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
    path: "/admin/*",
    element: <AdminPortalRedirect />,
  },
]);
