import { observer } from "mobx-react-lite";
import { MenuOutlined } from "@ant-design/icons";
import { Dropdown, Modal } from "antd";
import { createElement, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Profile from "@/modules/profile";
import LoginOrRegister from "@/modules/auth";
import { useHomeNavigation } from "../../hooks/use-home-navigation";
import { HomeUserEntry } from "./home-user-entry";

/** 渲染首页顶部导航条。 */
function HomeHeader() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
  const modalParam = searchParams.get("modal");
  const hasProfileModalParam = modalParam === "profile";
  const hasLoginModalParam = modalParam === "login";

  useEffect(() => {
    if (hasProfileModalParam) {
      setIsProfileModalVisible(true);
      return;
    }
    setIsProfileModalVisible(false);
  }, [hasProfileModalParam]);

  useEffect(() => {
    if (hasLoginModalParam) {
      setIsLoginModalVisible(true);
      return;
    }
    setIsLoginModalVisible(false);
  }, [hasLoginModalParam]);

  const {
    avatarUrl,
    isLoggedIn,
    navigationItems,
    openHome,
    openLogin,
    openRoute,
    userMenuItems,
    username,
  } = useHomeNavigation({
    onOpenProfile: () => {
      setIsProfileModalVisible(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("modal", "profile");
      setSearchParams(nextParams, { replace: true });
    },
    onOpenLogin: () => {
      setIsLoginModalVisible(true);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("modal", "login");
      setSearchParams(nextParams, { replace: true });
    },
  });

  const navMenuItems = useMemo(
    () =>
      navigationItems.map((item) => ({
        key: item.label,
        label: item.label,
        onClick: () => openRoute(item.path),
      })),
    [navigationItems, openRoute],
  );

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-[var(--ide-border)] bg-[var(--ide-header-bg)]">
      <div className="mx-auto flex h-[var(--header-height)] w-full items-center justify-between px-3">
        <div className="flex items-center gap-8">
          <button
            className="group flex items-center gap-2 text-left text-sm font-semibold tracking-tight text-[var(--ide-text)]"
            onClick={openHome}
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-[var(--ide-accent)] font-mono text-[12px] font-bold text-[var(--ide-statusbar-text)] shadow-[var(--ide-panel-shadow)]">
              C
            </div>
            <span className="font-mono tracking-wider">Codigo</span>
          </button>

          <ul className="hidden items-center gap-6 text-sm font-medium text-[var(--ide-text-muted)] lg:flex">
            {navigationItems.map((item) => (
              <li key={item.label}>
                <button
                  className="group relative transition-colors hover:text-[var(--ide-text)]"
                  onClick={() => openRoute(item.path)}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-[var(--ide-accent)] transition-all duration-300 group-hover:w-full" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-2">
          <Dropdown menu={{ items: navMenuItems }} placement="bottomRight" arrow>
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-transparent bg-transparent text-[var(--ide-text)] transition-colors hover:border-[var(--ide-control-border)] hover:bg-[var(--ide-hover)] lg:hidden"
              aria-label="打开导航菜单"
            >
              {createElement(MenuOutlined)}
            </button>
          </Dropdown>

          <HomeUserEntry
            avatarUrl={avatarUrl}
            isLoggedIn={isLoggedIn}
            openLogin={openLogin}
            userMenuItems={userMenuItems}
            username={username}
          />
        </div>
      </div>

      <Modal
        title="个人中心"
        open={isProfileModalVisible}
        onCancel={() => {
          setIsProfileModalVisible(false);
          const nextParams = new URLSearchParams(searchParams);
          nextParams.delete("modal");
          setSearchParams(nextParams, { replace: true });
        }}
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
          onUpdateSuccess={() => {
            setIsProfileModalVisible(false);
            const nextParams = new URLSearchParams(searchParams);
            nextParams.delete("modal");
            setSearchParams(nextParams, { replace: true });
          }}
        />
      </Modal>

      <Modal
        title="登录"
        open={isLoginModalVisible}
        onCancel={() => {
          setIsLoginModalVisible(false);
          const nextParams = new URLSearchParams(searchParams);
          nextParams.delete("modal");
          nextParams.delete("redirect");
          setSearchParams(nextParams, { replace: true });
        }}
        footer={null}
        width={520}
        destroyOnClose
        centered
        styles={{
          body: { padding: 0, maxHeight: "80vh", overflowY: "auto" },
        }}
      >
        <LoginOrRegister isModal={true} />
      </Modal>
    </nav>
  );
}

const HomeHeaderComponent = observer(HomeHeader);

export { HomeHeaderComponent as HomeHeader };
