import { useTitle } from "ahooks";

/** 管理后台占位页：用于暂未实现的后台模块。 */
export default function AdminPlaceholder(props: { title: string; desc?: string }) {
  useTitle(`Codigo - ${props.title}`);

  return (
    <div className="h-full p-4">
      <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-4 shadow-[var(--ide-panel-shadow)]">
        <div className="text-[13px] font-semibold text-[var(--ide-text)]">
          {props.title}
        </div>
        <div className="mt-1 text-[12px] text-[var(--ide-text-muted)]">
          {props.desc ?? "该模块已预留入口，后续按后台场景逐步补齐。"}
        </div>
      </div>
    </div>
  );
}

