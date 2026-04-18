import { BookOutlined, LogoutOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Space } from "antd";
import type { MenuProps } from "antd";
import { useNavigate, NavLink } from "react-router-dom";
import { useStoreAuth } from "@/shared/hooks";

/** 页面管理工作台顶部导航：入口包含开发文档与编辑器。 */
export default function AdminHeader() {
  const navigate = useNavigate();
  const { store: storeAuth, logout } = useStoreAuth();

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <SettingOutlined />,
      label: "个人中心",
      onClick: () => navigate("/profile"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      onClick: () => {
        logout();
        navigate("/login");
      },
    },
  ];

  return (
    <div className="flex w-full items-center gap-2.5 px-0.5 text-[13px]">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <button
          className="flex h-7 w-7 items-center justify-center rounded-sm bg-[var(--ide-accent)] text-white transition-opacity hover:opacity-90"
          onClick={() => navigate("/")}
        >
          <span className="font-mono text-xs font-bold">C</span>
        </button>

        <div className="min-w-0">
          <h1 className="truncate text-xs font-semibold tracking-tight text-[var(--ide-text)]">
            页面管理
          </h1>
        </div>

        <nav className="ml-2 flex items-center gap-1">
          <NavLink
            to="/doc"
            className={({ isActive }) =>
              [
                "inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[12px] transition-colors",
                isActive
                  ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
                  : "text-[var(--ide-text-muted)] hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]",
              ].join(" ")
            }
          >
            <BookOutlined className="text-[12px]" />
            开发文档
          </NavLink>
          <NavLink
            to="/editor"
            className={({ isActive }) =>
              [
                "inline-flex items-center gap-1 rounded-sm px-2 py-1 text-[12px] transition-colors",
                isActive
                  ? "bg-[var(--ide-active)] text-[var(--ide-text)]"
                  : "text-[var(--ide-text-muted)] hover:bg-[var(--ide-hover)] hover:text-[var(--ide-text)]",
              ].join(" ")
            }
          >
            <span className="font-mono text-[11px] font-bold">IDE</span>
            编辑器
          </NavLink>
        </nav>
      </div>

      <div className="flex flex-none items-center justify-end gap-2">
        <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={["click"]}>
          <button className="rounded-sm border border-transparent bg-transparent px-2 py-0.5 transition-colors hover:border-[var(--ide-control-border)] hover:bg-[var(--ide-hover)]">
            <Space size={6}>
              <Avatar
                src={
                  storeAuth.details?.head_img ? (
                    <img
                      src={storeAuth.details.head_img}
                      alt={storeAuth.details.username || "avatar"}
                      referrerPolicy="no-referrer"
                    />
                  ) : undefined
                }
                icon={!storeAuth.details?.head_img && <UserOutlined />}
                className={
                  !storeAuth.details?.head_img
                    ? "!h-6 !w-6 bg-[var(--ide-accent)]"
                    : "!h-6 !w-6 overflow-hidden"
                }
                style={
                  storeAuth.details?.head_img
                    ? { backgroundColor: "transparent" }
                    : undefined
                }
              />
              <div className="text-left">
                <div className="max-w-[120px] truncate text-[12px] font-medium leading-4 text-[var(--ide-text)]">
                  {storeAuth.details?.username || "未登录"}
                </div>
              </div>
            </Space>
          </button>
        </Dropdown>
      </div>
    </div>
  );
}
