import { RouterProvider } from "react-router-dom";
import "@/shared/assets/base.css";
import { AuthProvider } from "@/shared/auth/AuthProvider";
import { router } from "@/app/router";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
