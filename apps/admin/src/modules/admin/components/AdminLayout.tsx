import { Layout } from "antd";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/shared/auth/AuthProvider";
import { AdminAccountDropdown } from "@/modules/admin/components/AdminAccountDropdown";
import { AdminLoadingState } from "@/modules/admin/components/AdminLoadingState";
import { AdminSidebar } from "@/modules/admin/components/AdminSidebar";
import { useAdminAccess } from "@/modules/admin/hooks/useAdminAccess";

const { Content, Header, Sider } = Layout;

function resolveClientUrl() {
  return import.meta.env.VITE_CLIENT_URL ?? "http://localhost:5173";
}

export default function AdminLayout() {
  const { logout, user } = useAuth();
  const { hasAdminPermission } = useAdminAccess();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = location.pathname.replace("/", "") || "users";

  if (!user) {
    return <AdminLoadingState />;
  }

  return (
    <Layout className="h-screen overflow-hidden">
      <Sider width={220} theme="light" className="border-r border-slate-200">
        <div className="flex h-16 items-center justify-center border-b border-slate-200">
          <span className="text-lg font-bold text-slate-800">平台管理后台</span>
        </div>
        <AdminSidebar
          selectedKey={selectedKey}
          hasAdminPermission={hasAdminPermission}
          onNavigate={(key) => navigate(`/${key}`)}
        />
      </Sider>
      <Layout>
        <Header className="flex h-16 items-center justify-end border-b border-slate-200 bg-white px-6">
          <AdminAccountDropdown
            user={user}
            onLogout={() => {
              logout();
              navigate("/login");
            }}
            onBackToWorkbench={() => {
              window.location.href = resolveClientUrl();
            }}
          />
        </Header>
        <Content className="m-6 overflow-auto rounded-lg bg-white p-6 shadow-sm">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
