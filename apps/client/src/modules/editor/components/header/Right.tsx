import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, Space, Modal } from "antd";
import type { MenuProps } from "antd";
import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { useStoreAuth } from "@/shared/hooks";
import { useState } from "react";
import Profile from "@/modules/profile";

export default observer(function Right() {
  const navigate = useNavigate();
  const { store: storeAuth, logout } = useStoreAuth();
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人中心",
      onClick: () => setIsProfileModalVisible(true),
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

  const roleLabel =
    storeAuth.details?.global_role === "SUPER_ADMIN"
      ? "超管"
      : storeAuth.details?.global_role === "ADMIN"
        ? "管理员"
        : "协作者";

  return (
    <>
      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomRight"
        trigger={["click"]}
      >
        <button className="rounded-xl border border-slate-200/80 bg-white/85 px-2 py-1 shadow-[0_12px_24px_-22px_rgba(15,23,42,0.5)] transition-all hover:border-emerald-200 hover:shadow-[0_14px_28px_-22px_rgba(16,185,129,0.4)]">
          <Space size={8}>
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
                  ? "!h-7 !w-7 bg-emerald-500 border border-emerald-500/20"
                  : "!h-7 !w-7 border border-emerald-500/20"
              }
            />
            <div className="text-left">
              <div className="max-w-[96px] truncate text-[13px] font-medium leading-4 text-slate-900">
                {storeAuth.details?.username || "未登录用户"}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-400">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>{roleLabel}</span>
              </div>
            </div>
          </Space>
        </button>
      </Dropdown>

      <Modal
        title="个人中心"
        open={isProfileModalVisible}
        onCancel={() => setIsProfileModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
        centered
        styles={{
          body: { padding: 0, maxHeight: "80vh", overflowY: "auto" },
        }}
      >
        <Profile
          isModal={true}
          onUpdateSuccess={() => setIsProfileModalVisible(false)}
        />
      </Modal>
    </>
  );
});
