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
        className="text-sm font-medium text-[var(--ide-text-muted)] transition-colors hover:text-[var(--ide-text)]"
        onClick={openLogin}
      >
        登录
      </button>
    );
  }

  return (
    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow>
      <button className="flex items-center gap-2 rounded-sm border border-transparent bg-transparent px-2.5 py-1 transition-colors hover:border-[var(--ide-control-border)] hover:bg-[var(--ide-hover)]">
        <Avatar
          src={avatarUrl ? <img src={avatarUrl} alt={username || "avatar"} referrerPolicy="no-referrer" /> : undefined}
          icon={!avatarUrl && <UserOutlined />}
          className={avatarUrl ? "overflow-hidden" : ""}
          style={
            avatarUrl
              ? { backgroundColor: "transparent" }
              : { backgroundColor: "var(--ide-accent)" }
          }
        />
        <span className="hidden text-sm font-medium text-[var(--ide-text)] sm:inline">
          {username || "已登录"}
        </span>
      </button>
    </Dropdown>
  );
}
