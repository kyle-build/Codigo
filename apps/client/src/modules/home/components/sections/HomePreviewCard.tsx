const stats = [
  { label: "在线模板", value: "180+" },
  { label: "企业团队", value: "2,600+" },
  { label: "月活编辑页", value: "12.8w" },
];

/** 渲染首页右侧的产品数据预览卡片。 */
export function HomePreviewCard() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-full bg-emerald-500/20 opacity-20 blur-3xl" />
      <div className="relative rounded-2xl border border-white/10 bg-[#0A0C14]/80 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-8 flex items-center justify-between border-b border-white/5 pb-4">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full border border-red-500/50 bg-red-500/20" />
            <div className="h-3 w-3 rounded-full border border-yellow-500/50 bg-yellow-500/20" />
            <div className="h-3 w-3 rounded-full border border-green-500/50 bg-green-500/20" />
          </div>
          <div className="font-mono text-xs text-gray-500">system_status: active</div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="group rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5"
            >
              <div className="font-mono text-3xl font-bold tracking-tighter text-white transition-colors group-hover:text-emerald-400">
                {item.value}
              </div>
              <div className="mt-2 text-xs font-medium uppercase tracking-wider text-gray-500 transition-colors group-hover:text-gray-300">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <div className="h-2 w-3/4 overflow-hidden rounded-full bg-white/5">
            <div className="h-full w-2/3 animate-shimmer rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500" />
          </div>
          <div className="h-2 w-1/2 rounded-full bg-white/5" />
          <div className="h-2 w-full rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  );
}
