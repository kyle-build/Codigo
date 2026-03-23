import { RouterProvider } from "react-router-dom";
import "@/shared/assets/base.css";
import { router } from "./router";
function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;












