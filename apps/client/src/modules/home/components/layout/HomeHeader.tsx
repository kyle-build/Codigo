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
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-12">
          <button
            className="group flex items-center gap-2 text-left text-xl font-bold tracking-tight text-slate-900"
            onClick={openHome}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500 font-mono text-lg font-bold text-white shadow-lg shadow-emerald-500/30">
              C
            </div>
            <span className="font-mono tracking-wider">Codigo</span>
          </button>

          <ul className="hidden items-center gap-8 text-sm font-medium text-slate-500 lg:flex">
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
