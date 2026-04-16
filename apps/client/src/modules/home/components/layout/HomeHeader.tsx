import { observer } from "mobx-react-lite";
import { useHomeNavigation } from "../../hooks/useHomeNavigation";
import { HomeUserEntry } from "./HomeUserEntry";

/** 渲染首页顶部导航条。 */
export const HomeHeader = observer(() => {
  const {
    avatarUrl,
    isLoggedIn,
    navigationItems,
    openHome,
    openLogin,
    openRoute,
    userMenuItems,
    username,
  } = useHomeNavigation();

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-12 w-full items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <button
            className="group flex items-center gap-2 text-left text-base font-semibold tracking-tight text-slate-900"
            onClick={openHome}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded bg-emerald-500 font-mono text-sm font-bold text-white shadow-sm shadow-emerald-500/20">
              C
            </div>
            <span className="font-mono tracking-wider">Codigo</span>
          </button>

          <ul className="hidden items-center gap-6 text-sm font-medium text-slate-500 lg:flex">
            {navigationItems.map((item) => (
              <li key={item.label}>
                <button
                  className="group relative transition-colors hover:text-emerald-500"
                  onClick={() => openRoute(item.path)}
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-emerald-500 transition-all duration-300 group-hover:w-full" />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <HomeUserEntry
          avatarUrl={avatarUrl}
          isLoggedIn={isLoggedIn}
          openLogin={openLogin}
          userMenuItems={userMenuItems}
          username={username}
        />
      </div>
    </nav>
  );
});
