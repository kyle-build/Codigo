import { useNavigate } from "react-router-dom";

const stats = [
  { label: "在线模板", value: "180+" },
  { label: "企业团队", value: "2,600+" },
  { label: "月活编辑页", value: "12.8w" },
];

const features = [
  {
    title: "拖拽式编辑",
    desc: "组件化画布和即时预览，业务同学也能快速完成页面搭建。",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        />
      </svg>
    ),
  },
  {
    title: "数据回流分析",
    desc: "统一采集组件埋点，实时查看提交、转化与来源分布。",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
  },
  {
    title: "发布与回滚",
    desc: "支持一键发布和版本管理，故障场景可迅速回退。",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
    ),
  },
];

export function HomeCenter() {
  const navigate = useNavigate();

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-20 pt-10">
      <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-50 text-emerald-600 px-4 py-1.5 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse mr-2"></span>
            <span className="text-xs font-mono font-medium tracking-wider">
              CODIGO SYSTEM v1.0
            </span>
          </div>

          <h1 className="mt-8 text-5xl font-bold leading-tight text-slate-900 md:text-7xl tracking-tight">
            <span className="text-slate-900">让业务页面构建</span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
              像搭积木一样简单
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 font-light">
            从页面搭建、组件配置、数据统计到最终发布，Codigo
            提供统一的可视化平台，帮助团队更快验证想法并持续优化业务转化。
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <button
              className="group relative inline-flex items-center justify-center rounded-xl bg-emerald-500 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              onClick={() => navigate("/templates")}
            >
              <span className="mr-2">进入模板选择</span>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
            <button
              className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-sm font-medium text-white transition-all hover:bg-white/10 hover:border-white/30"
              onClick={() => navigate("/dataCount")}
            >
              查看数据看板
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-emerald-500/20 blur-3xl rounded-full opacity-20"></div>

          <div className="relative rounded-2xl border border-white/10 bg-[#0A0C14]/80 p-8 backdrop-blur-xl shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-cyan-500 opacity-50 rounded-t-2xl"></div>

            <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
              <div className="text-xs font-mono text-gray-500">
                system_status: active
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {stats.map((item) => (
                <div
                  key={item.label}
                  className="group rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
                >
                  <div className="text-3xl font-bold text-white font-mono tracking-tighter group-hover:text-emerald-400 transition-colors">
                    {item.value}
                  </div>
                  <div className="mt-2 text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-gray-300 transition-colors">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              <div className="h-2 w-3/4 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full w-2/3 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full animate-shimmer"></div>
              </div>
              <div className="h-2 w-1/2 rounded-full bg-white/5"></div>
              <div className="h-2 w-full rounded-full bg-white/5"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-24 grid gap-6 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="group relative rounded-2xl border border-white/10 bg-[#0A0C14]/80 p-8 transition-all hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100 rounded-2xl"></div>

            <div className="relative z-10">
              <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-emerald-300 transition-colors">
                {feature.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-gray-400">
                {feature.desc}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}












