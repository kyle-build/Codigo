import { Outlet } from "react-router-dom";
import { Topbar } from "@/app/layouts/components/topbar/Topbar";

export function StudioLayout() {
  return (
    <div className="app-layout">
      <Topbar />

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
