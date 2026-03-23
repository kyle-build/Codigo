import { createHashRouter } from "react-router-dom";
import Editor from "@/modules/editor";
import Home from "@/modules/home/index";
import DataCount from "@/modules/dataCount/dataCount";
import Release from "@/modules/release";
import Preview from "@/modules/preview";
import LoginOrRegister from "@/modules/auth/loginOrRegister";
// import Form from "@/modules/form/form";
import Flow from "@/modules/flow/flow";
import Report from "@/modules/report/reportDesigner";
import DevDoc from "@/modules/devDocument/DevDoc";
import TemplateSelect from "@/modules/home/TemplateSelect";
import { StudioLayout } from "@/app/layouts/StudioLayout";

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
  // {
  //   path: "/form",
  //   element: <Form />,
  // },
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
      {
        path: "/report",
        element: <Report />,
      },
    ],
  },
]);
