const stats = [
  { label: "在线模板", value: "180+" },
  { label: "企业团队", value: "2,600+" },
  { label: "月活编辑页", value: "12.8w" },
];
export function HomePreviewCard() {
  return (
    <div className="relative">
      <div className="relative rounded-md border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-6 shadow-[var(--ide-panel-shadow)]">
        <div className="mb-6 flex items-center justify-between border-b border-[var(--ide-border)] pb-3">
          <div className="flex gap-2">
            <div className="h-3 w-3 rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)]" />
            <div className="h-3 w-3 rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)]" />
            <div className="h-3 w-3 rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)]" />
          </div>
          <div className="font-mono text-xs text-[var(--ide-text-muted)]">
            system_status: active
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] p-4 transition-colors hover:bg-[var(--ide-hover)]"
            >
              <div className="font-mono text-2xl font-bold tracking-tighter text-[var(--ide-text)]">
                {item.value}
              </div>
              <div className="mt-2 text-xs font-medium uppercase tracking-wider text-[var(--ide-text-muted)]">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-3">
          <div className="h-2 w-3/4 overflow-hidden rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)]">
            <div className="h-full w-2/3 animate-shimmer rounded-full bg-[var(--ide-accent)]" />
          </div>
          <div className="h-2 w-1/2 rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)]" />
          <div className="h-2 w-full rounded-full border border-[var(--ide-border)] bg-[var(--ide-hover)]" />
        </div>
      </div>
    </div>
  );
}
