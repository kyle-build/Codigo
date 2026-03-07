// import { test } from "@codigo/share";
import { RouterProvider } from "react-router-dom";
import "./assets/base.css";
import { router } from "./router";
function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
