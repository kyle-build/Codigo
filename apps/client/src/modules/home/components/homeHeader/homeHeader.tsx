import { useNavigate } from "react-router-dom";
import { observer } from "mobx-react-lite";
import { Avatar, Dropdown, Modal } from "antd";
import type { MenuProps } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useStoreAuth } from "@/shared/hooks/useStoreAuth";
import { useState } from "react";
import Profile from "@/modules/profile";

const menus = [
  { label: "应用管理", path: "/app-management?tab=published" },
  { label: "数据看板", path: "/dataCount" },
  { label: "开发文档", path: "/doc" },
];

export const HomeHeader = observer(() => {
  const navigate = useNavigate();
  const { isLogin, logout, store: storeAuth } = useStoreAuth();
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);

  const userMenuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "个人中心",
      onClick: () => {
        setIsProfileModalVisible(true);
      },
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
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-12">
          <button
            className="group flex items-center gap-2 text-left text-xl font-bold tracking-tight text-slate-900"
            onClick={() => navigate("/")}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500 text-white font-mono text-lg font-bold shadow-lg shadow-emerald-500/30">
              C
            </div>
            <span className="font-mono tracking-wider">Codigo</span>
          </button>

          <ul className="hidden items-center gap-8 text-sm font-medium text-slate-500 lg:flex">
            {menus.map((item) => (
              <li
                key={item.label}
                className="relative cursor-pointer transition-colors hover:text-emerald-500 group"
                onClick={() => navigate(item.path)}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-emerald-500 transition-all duration-300 group-hover:w-full"></span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4">
          {isLogin.get() ? (
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <div className="cursor-pointer transition-transform hover:scale-105">
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
                    !storeAuth.details?.head_img ? "bg-emerald-500" : ""
                  }
                />
              </div>
            </Dropdown>
          ) : (
            <button
              className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
              onClick={() => navigate("/login")}
            >
              登录
            </button>
          )}
        </div>
      </div>

      <Modal
        title="个人中心"
        open={isProfileModalVisible}
        onCancel={() => setIsProfileModalVisible(false)}
        footer={null}
        width={600}
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
    </nav>
  );
});
