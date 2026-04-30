import type { ReactNode } from "react";
import { message } from "antd";
import { observer } from "mobx-react-lite";
import type { PageShellLayout } from "@codigo/schema";
import { useEditorPage } from "@/modules/editor/hooks";

interface EditorLayoutManagerProps {
  embedded?: boolean;
  variant?: "dropdown";
}

type LayoutPreset = {
  key: PageShellLayout;
  name: string;
  desc: string;
};

function MiniLayoutPreview({ layout }: { layout: PageShellLayout }) {
  const Base = ({ children }: { children: ReactNode }) => (
    <div className="h-12 w-full rounded-md border border-[var(--ide-border)] bg-[rgba(255,255,255,0.04)] p-1">
      <div className="h-full w-full rounded-[6px] bg-[rgba(255,255,255,0.06)]">{children}</div>
    </div>
  );

  const Bar = ({ className = "" }: { className?: string }) => (
    <div className={`rounded-[5px] bg-[rgba(99,102,241,0.75)] ${className}`} />
  );
  const Panel = ({ className = "" }: { className?: string }) => (
    <div className={`rounded-[5px] bg-[rgba(148,163,184,0.35)] ${className}`} />
  );
  const Content = ({ className = "" }: { className?: string }) => (
    <div className={`rounded-[5px] bg-[rgba(148,163,184,0.22)] ${className}`} />
  );

  if (layout === "none") {
    return (
      <Base>
        <div className="h-full w-full p-1">
          <Content className="h-full w-full" />
        </div>
      </Base>
    );
  }

  if (layout === "leftRight") {
    return (
      <Base>
        <div className="h-full w-full flex gap-1 p-1">
          <Panel className="h-full w-[26%]" />
          <Content className="h-full flex-1" />
        </div>
      </Base>
    );
  }

  if (layout === "topBottom") {
    return (
      <Base>
        <div className="h-full w-full flex flex-col gap-1 p-1">
          <Bar className="h-[22%] w-full" />
          <Content className="flex-1 w-full" />
        </div>
      </Base>
    );
  }

  if (layout === "leftTop") {
    return (
      <Base>
        <div className="h-full w-full flex flex-col gap-1 p-1">
          <Bar className="h-[22%] w-full" />
          <div className="flex-1 w-full flex gap-1">
            <Panel className="h-full w-[26%]" />
            <Content className="h-full flex-1" />
          </div>
        </div>
      </Base>
    );
  }

  if (layout === "topLeft") {
    return (
      <Base>
        <div className="h-full w-full flex flex-col gap-1 p-1">
          <Bar className="h-[22%] w-full" />
          <div className="flex-1 w-full flex gap-1">
            <Panel className="h-full w-[26%]" />
            <Content className="h-full flex-1" />
          </div>
        </div>
      </Base>
    );
  }

  return (
    <Base>
      <div className="h-full w-full flex flex-col gap-1 p-1">
        <Bar className="h-[22%] w-full" />
        <Panel className="h-[18%] w-[55%]" />
        <Content className="flex-1 w-full" />
      </div>
    </Base>
  );
}

function EditorLayoutManager({
  embedded = true,
  variant = "dropdown",
}: EditorLayoutManagerProps) {
  const { store: pageStore, updatePage } = useEditorPage();

  const containerClassName =
    embedded && variant === "dropdown"
      ? "flex w-[340px] max-h-[560px] min-h-0 flex-col overflow-hidden rounded-md border border-[var(--ide-border)] bg-[var(--ide-sidebar-bg)] shadow-[0_14px_40px_-28px_rgba(0,0,0,0.55)]"
      : "flex h-full min-h-0 flex-col overflow-hidden bg-[var(--ide-sidebar-bg)]";

  const presets: LayoutPreset[] = [
    { key: "leftRight", name: "左右布局", desc: "左侧导航 + 内容区" },
    { key: "topBottom", name: "上下布局", desc: "顶部导航 + 内容区" },
    { key: "leftTop", name: "左上布局", desc: "顶部栏 + 左侧导航" },
    { key: "breadcrumb", name: "面包屑布局", desc: "顶部栏 + 面包屑" },
    { key: "topLeft", name: "上左布局", desc: "顶部栏 + 二级侧栏" },
    { key: "none", name: "无布局", desc: "仅内容区" },
  ];

  return (
    <div className={containerClassName}>
      <div className="flex items-center justify-between border-b border-[var(--ide-border)] px-4 py-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text-muted)]">
          布局设置
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 scrollbar-thin scrollbar-thumb-[var(--ide-border)] hover:scrollbar-thumb-[var(--ide-text-muted)] scrollbar-track-transparent">
        <div className="grid grid-cols-2 gap-2">
          {presets.map((preset) => {
            const active = pageStore.shellLayout === preset.key;
            return (
              <button
                key={preset.key}
                type="button"
                onClick={() => {
                  updatePage({ shellLayout: preset.key });
                  message.success(`已切换：${preset.name}`);
                }}
                className={`group rounded-md border px-3 py-3 text-left transition-colors ${
                  active
                    ? "border-[var(--ide-accent)] bg-[rgba(99,102,241,0.12)]"
                    : "border-[var(--ide-border)] bg-[var(--ide-control-bg)] hover:bg-[var(--ide-hover)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[12px] font-medium text-[var(--ide-text)]">
                    {preset.name}
                  </div>
                  <span
                    className={`text-[10px] transition-colors ${
                      active
                        ? "text-[var(--ide-accent)]"
                        : "text-[var(--ide-text-muted)] group-hover:text-[var(--ide-text)]"
                    }`}
                  >
                    {active ? "已选" : "选择"}
                  </span>
                </div>
                <div className="mt-1 text-[10px] text-[var(--ide-text-muted)]">
                  {preset.desc}
                </div>
                <div className="mt-2">
                  <MiniLayoutPreview layout={preset.key} />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const EditorLayoutManagerComponent = observer(EditorLayoutManager);

export default EditorLayoutManagerComponent;
