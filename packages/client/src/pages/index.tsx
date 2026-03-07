import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
export default function Home() {
  const nav = useNavigate();
  const location = useLocation();
  function beforceRouteChange(location: any) {
    if (true)
      location.pathname !== "/login_or_register" && nav("/login_or_register");
    else {
    }
  }
  useEffect(() => {
    beforceRouteChange(location);
  }, [location.pathname]);
  return (
    <>
      <Outlet />
    </>
  );
}
