import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useStoreAuth } from "@/shared/hooks";
import { useEffect } from "react";

function App() {
  const { fetchUserInfo, store } = useStoreAuth();

  useEffect(() => {
    if (store.token && !store.details) {
      fetchUserInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
