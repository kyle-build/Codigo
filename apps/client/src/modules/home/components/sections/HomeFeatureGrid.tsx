const features = [
  {
    path: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z",
    title: "拖拽式编辑",
    description: "组件化画布和即时预览，业务同学也能快速完成页面搭建。",
  },
  {
    path: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
    title: "数据回流分析",
    description: "统一采集组件埋点，实时查看提交、转化与来源分布。",
  },
  {
    path: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
    title: "发布与回滚",
    description: "支持一键发布和版本管理，故障场景可迅速回退。",
  },
];

/** 渲染首页能力特性卡片。 */
export function HomeFeatureGrid() {
  return (
    <section className="mx-auto mt-4 grid w-full max-w-7xl gap-6 px-6 pb-24 md:grid-cols-3">
      {features.map((feature) => (
        <article
          key={feature.title}
          className="group relative rounded-2xl border border-white/10 bg-[#0A0C14]/80 p-8 transition-all hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10"
        >
          <div className="relative z-10">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.path} />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white transition-colors group-hover:text-emerald-300">
              {feature.title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              {feature.description}
            </p>
          </div>
        </article>
      ))}
    </section>
  );
}
