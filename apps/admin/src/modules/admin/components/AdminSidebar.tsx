import type { AdminPermission } from "@codigo/schema";
import { Menu } from "antd";
import { adminNavigationItems } from "@/modules/admin/config/navigation";

interface AdminSidebarProps {
  hasAdminPermission: (permission: AdminPermission) => boolean;
  onNavigate: (key: string) => void;
  selectedKey: string;
}

export function AdminSidebar({
  hasAdminPermission,
  onNavigate,
  selectedKey,
}: AdminSidebarProps) {
  return (
    <Menu
      mode="inline"
      selectedKeys={[selectedKey]}
      className="h-[calc(100%-64px)] border-r-0 pt-4"
      onClick={({ key }) => onNavigate(key)}
      items={adminNavigationItems.map((item) => ({
        disabled: !hasAdminPermission(item.permission),
        icon: item.icon,
        key: item.key,
        label: item.label,
      }))}
    />
  );
}
