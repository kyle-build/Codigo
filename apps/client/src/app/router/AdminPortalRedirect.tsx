import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function resolveAdminUrl(pathname: string) {
  const base = (import.meta.env.VITE_ADMIN_URL ?? "http://localhost:5174").replace(
    /\/$/,
    "",
  );
  const targetPath = pathname.replace(/^\/admin/, "") || "/";
  return `${base}/#${targetPath}`;
}

export function AdminPortalRedirect() {
  const location = useLocation();

  useEffect(() => {
    window.location.replace(resolveAdminUrl(location.pathname));
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center text-slate-500">
      正在跳转到独立后台…
    </div>
  );
}
