import { useHomeNavigation } from "../../hooks/useHomeNavigation";
import { HomePreviewCard } from "./HomePreviewCard";

/** 渲染首页首屏营销信息与核心行动按钮。 */
export function HomeHeroSection() {
  const { openAppManagement, openDashboard } = useHomeNavigation();

  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-20 pt-10">
      <div className="grid gap-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <div className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-50 px-4 py-1.5 text-emerald-600 backdrop-blur-md">
            <span className="mr-2 flex h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
            <span className="font-mono text-xs font-medium tracking-wider">
              CODIGO SYSTEM v1.0
            </span>
          </div>

          <h1 className="mt-8 text-5xl font-bold leading-tight tracking-tight text-slate-900 md:text-7xl">
            <span>让业务页面构建</span>
            <br />
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              像搭积木一样简单
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg font-light leading-8 text-slate-600">
            从页面搭建、组件配置、数据统计到最终发布，Codigo
            提供统一的可视化平台，帮助团队更快验证想法并持续优化业务转化。
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-5">
            <button
              className="group inline-flex items-center justify-center rounded-xl bg-emerald-500 px-8 py-4 text-sm font-bold text-white transition-all hover:bg-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              onClick={openAppManagement}
            >
              <span className="mr-2">进入应用管理</span>
              <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-8 py-4 text-sm font-medium text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50"
              onClick={openDashboard}
            >
              查看数据看板
            </button>
          </div>
        </div>

        <HomePreviewCard />
      </div>
    </section>
  );
}
