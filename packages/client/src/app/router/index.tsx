import { createHashRouter } from "react-router-dom";
import Editor from "@/modules/editor/Editor";
import Home from "@/modules/home/index";
import DataCount from "@/modules/dataCount/dataCount";
import Release from "@/modules/editor/release";
import Preview from "@/modules/editor/preview";
import LoginOrRegister from "@/modules/auth/loginOrRegister";
// import Form from "@/modules/form/form";
import Flow from "@/modules/flow/flow";
import Report from "@/modules/report/reportDesigner";
export const router = createHashRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <LoginOrRegister />,
  },
  {
    path: "/editor",
    element: <Editor />,
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
    path: "/flow",
    element: <Flow />,
  },
  {
    path: "/report",
    element: <Report />,
  },
]);
