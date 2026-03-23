export function HomeFooter() {
  return (
    <footer className="relative z-10 border-t border-slate-200 bg-slate-50 overflow-hidden">
      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:linear-gradient(to_bottom,transparent,black)]"></div>

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-12 md:flex-row md:items-center md:justify-between relative z-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-emerald-500/10 text-emerald-600 font-mono text-xs font-bold border border-emerald-500/20">
              C
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight">
              Codigo System
            </span>
          </div>
          <p className="max-w-xs text-sm text-slate-500 leading-relaxed">
            让产品、运营与研发在同一个页面语言中协作。
            <br />
            Building the future of low-code.
          </p>
        </div>

        <div className="flex flex-col md:items-end gap-4">
          <ul className="flex flex-wrap items-center gap-8 text-sm text-slate-500 font-medium">
            <li className="cursor-pointer transition hover:text-emerald-600 hover:underline hover:underline-offset-4">
              帮助中心
            </li>
            <li className="cursor-pointer transition hover:text-emerald-600 hover:underline hover:underline-offset-4">
              更新日志
            </li>
            <li className="cursor-pointer transition hover:text-emerald-600 hover:underline hover:underline-offset-4">
              社区反馈
            </li>
            <li className="cursor-pointer transition hover:text-emerald-600 hover:underline hover:underline-offset-4">
              联系我们
            </li>
          </ul>
          <div className="text-xs text-slate-400 font-mono">
            © 2024 Codigo System. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}












