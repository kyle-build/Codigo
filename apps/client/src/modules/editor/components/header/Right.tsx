import {
  LogoutOutlined,
  RightOutlined,
  ShareAltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Avatar, Dropdown, Modal, Popover, Space, message } from "antd";
import type { MenuProps } from "antd";
import { observer } from "mobx-react-lite";
import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStoreAuth } from "@/shared/hooks";
import Profile from "@/modules/profile";
import { useEditorPermission } from "@/modules/editor/hooks";

export default observer(function Right() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { store: storeAuth, logout } = useStoreAuth();
  const { store: storePermission } = useEditorPermission();
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const pageId = Number(searchParams.get("id"));

  const devShareUrl = useMemo(() => {
    if (!pageId || typeof window === "undefined") {
      return "";
    }
    const base = window.location.href.split("#")[0];
    return `${base}#/editor?id=${pageId}`;
  }, [pageId]);

  const currentUserId = storeAuth.details?.id;
  const otherCollaborators = storePermission.collaborators.filter((item) =>
    currentUserId ? item.user_id !== currentUserId : true,
  );

  const visibleCollaborators = otherCollaborators.slice(0, 3);
  const restCollaboratorCount = otherCollaborators.length - visibleCollaborators.length;

  const handleCopyDevLink = async () => {
    if (!devShareUrl) {
      message.warning("当前页面还未完成初始化");
      return;
    }

    try {
      await navigator.clipboard.writeText(devShareUrl);
      message.success("开发链接已复制");
    } catch {
      window.prompt("复制开发链接", devShareUrl);
    }
  };

  const handleOpenPermissionSettings = () => {
    if (!pageId) {
      message.warning("当前页面还未完成初始化");
      return;
    }
    setShareOpen(false);
    navigate(`/console/permissions?id=${pageId}`);
  };

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
        navigate("/?modal=login");
      },
    },
  ];

  return (
    <>
      <div className="flex items-center gap-2">
        {otherCollaborators.length > 0 ? (
          <div className="flex items-center -space-x-1.5">
            {visibleCollaborators.map((item) => (
              <Avatar
                key={item.id}
                size={24}
                style={{
                  backgroundColor: item.color,
                  color: "white",
                }}
              >
                {(item.name || "U").charAt(0).toUpperCase()}
              </Avatar>
            ))}
            {restCollaboratorCount > 0 ? (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--ide-hover)] text-[11px] text-[var(--ide-text-muted)]">
                +{restCollaboratorCount}
              </div>
            ) : null}
          </div>
        ) : null}

        <Popover
          open={shareOpen}
          onOpenChange={setShareOpen}
          trigger={["click"]}
          placement="bottomRight"
          content={
            <div className="w-[280px]">
              <div className="flex items-center justify-between gap-2">
                <div className="text-[13px] font-semibold text-[var(--ide-text)]">
                  分享链接
                </div>
                <button
                  className="flex items-center gap-1 text-[12px] text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
                  onClick={handleOpenPermissionSettings}
                  type="button"
                >
                  权限设置
                  <RightOutlined className="text-[11px]" />
                </button>
              </div>
              <div className="mt-1 text-[12px] text-[var(--ide-text-muted)]">
                复制开发链接给协作者（需要登录并在权限设置中已加入该用户）。
              </div>
              <button
                className="mt-3 w-full rounded-sm border border-[var(--ide-control-border)] bg-[var(--ide-control-bg)] px-3 py-2 text-[12px] font-medium text-[var(--ide-text)] hover:bg-[var(--ide-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleCopyDevLink}
                type="button"
                disabled={!devShareUrl}
              >
                复制开发链接
              </button>
            </div>
          }
        >
          <button
            className="rounded-sm border border-transparent bg-transparent px-2 py-0.5 text-[12px] text-[var(--ide-text)] transition-colors hover:border-[var(--ide-control-border)] hover:bg-[var(--ide-hover)]"
            type="button"
          >
            <Space size={6}>
              <ShareAltOutlined />
              分享
            </Space>
          </button>
        </Popover>

      <Dropdown
        menu={{ items: menuItems }}
        placement="bottomRight"
        trigger={["click"]}
      >
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
              <div className="max-w-[80px] truncate text-[12px] font-medium leading-4 text-[var(--ide-text)]">
                {storeAuth.details?.username || "未登录"}
              </div>
            </div>
          </Space>
        </button>
      </Dropdown>
      </div>

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
