import { Avatar, Dropdown } from "antd";
import { UserOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";

interface HomeUserEntryProps {
  avatarUrl?: string;
  isLoggedIn: boolean;
  openLogin: () => void;
  userMenuItems: MenuProps["items"];
  username?: string;
}

/** 渲染首页右上角的登录态入口。 */
export function HomeUserEntry({
  avatarUrl,
  isLoggedIn,
  openLogin,
  userMenuItems,
  username,
}: HomeUserEntryProps) {
  if (!isLoggedIn) {
    return (
      <button
        className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
        onClick={openLogin}
      >
        登录
      </button>
    );
  }

  return (
    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
      <button className="flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1.5 transition hover:border-emerald-200 hover:bg-white">
        <Avatar
          src={avatarUrl ? <img src={avatarUrl} alt={username || "avatar"} referrerPolicy="no-referrer" /> : undefined}
          icon={!avatarUrl && <UserOutlined />}
          className={!avatarUrl ? "bg-emerald-500" : ""}
        />
        <span className="hidden text-sm font-medium text-slate-600 sm:inline">
          {username || "已登录"}
        </span>
      </button>
    </Dropdown>
  );
}
