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
        <button className="rounded-sm border border-[#3c3c3c] bg-[#3c3c3c] px-2 py-0.5 transition-colors hover:bg-[#454545] hover:border-[#555555]">
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
                  ? "!h-6 !w-6 bg-[#0e639c] border border-[#3c3c3c]"
                  : "!h-6 !w-6 border border-[#3c3c3c]"
              }
            />
            <div className="text-left">
              <div className="max-w-[80px] truncate text-[12px] font-medium leading-4 text-[#cccccc]">
                {storeAuth.details?.username || "未登录"}
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
