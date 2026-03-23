import { useNavigate } from "react-router-dom";

const menus = [
  { label: "模板案例", path: "/templates" },
  { label: "数据看板", path: "/dataCount" },
  { label: "开发文档", path: "/doc" },
];

export function HomeHeader() {
  const navigate = useNavigate();

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
          <button
            className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
            onClick={() => navigate("/login_or_register")}
          >
            登录
          </button>
          <button
            className="rounded-lg bg-emerald-500 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/30 hover:-translate-y-0.5"
            onClick={() => navigate("/templates")}
          >
            选择模板
          </button>
        </div>
      </div>
    </nav>
  );
}












