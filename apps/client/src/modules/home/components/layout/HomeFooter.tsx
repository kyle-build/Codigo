/** 渲染首页底部说明与辅助链接。 */
export function HomeFooter() {
  return (
    <footer className="relative z-10 overflow-hidden border-t border-slate-200 bg-slate-50">
      <div className="mx-auto relative z-10 flex w-full max-w-7xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded border border-emerald-500/20 bg-emerald-500/10 font-mono text-xs font-bold text-emerald-600">
              C
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Codigo System
            </span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-slate-500">
            让产品、运营与研发在同一个页面语言中协作。
            <br />
            Building the future of low-code.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:items-end">
          <ul className="flex flex-wrap items-center gap-8 text-sm font-medium text-slate-500">
            <li className="cursor-pointer transition hover:text-emerald-600">帮助中心</li>
            <li className="cursor-pointer transition hover:text-emerald-600">更新日志</li>
            <li className="cursor-pointer transition hover:text-emerald-600">社区反馈</li>
            <li className="cursor-pointer transition hover:text-emerald-600">联系我们</li>
          </ul>
          <div className="font-mono text-xs text-slate-400">
            © 2026 Codigo System. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
