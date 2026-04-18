import { Tabs } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import ComponentList from "./ComponentList";
import BlockList from "./BlockList";

interface EditorLeftPanelProps {
  embedded?: boolean;
}

export default function EdiotLeftPanel({
  embedded = false,
}: EditorLeftPanelProps) {
  const [active, setActive] = useState<"materials" | "blocks">("materials");
  const headerTabs = useMemo(() => {
    const tabBase = "rounded-sm px-2.5 py-1 text-[11px] font-medium transition-colors";
    return (
      <div className="flex items-center gap-1 rounded-md bg-[var(--ide-active)] p-1">
        <button
          type="button"
          onClick={() => setActive("materials")}
          className={`${tabBase} ${
            active === "materials"
              ? "bg-[var(--ide-control-bg)] text-[var(--ide-text)]"
              : "text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
          }`}
        >
          物料
        </button>
        <button
          type="button"
          onClick={() => setActive("blocks")}
          className={`${tabBase} ${
            active === "blocks"
              ? "bg-[var(--ide-control-bg)] text-[var(--ide-text)]"
              : "text-[var(--ide-text-muted)] hover:text-[var(--ide-text)]"
          }`}
        >
          区块
        </button>
      </div>
    );
  }, [active]);

  if (embedded) {
    return (
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[var(--ide-sidebar-bg)]">
        <div className="flex items-center justify-between border-b border-[var(--ide-border)] px-4 py-2">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text-muted)]">
              物料
            </div>
          </div>
          <span className="flex h-6 w-6 items-center justify-center text-[var(--ide-text-muted)]">
            <AppstoreOutlined />
          </span>
        </div>
        <div className="flex items-center justify-between border-b border-[var(--ide-border)] px-4 py-2">
          {headerTabs}
        </div>
        <div className="min-h-0 flex-1 px-1 py-1">
          {active === "materials" ? <ComponentList /> : <BlockList />}
        </div>
      </div>
    );
  }

  const items = [
    {
      key: "component-list",
      label: (
        <span className="flex items-center gap-2">
          <AppstoreOutlined /> <span>物料</span>
        </span>
      ),
      children: <ComponentList />,
    },
    {
      key: "block-list",
      label: (
        <span className="flex items-center gap-2">
          <AppstoreOutlined /> <span>区块</span>
        </span>
      ),
      children: <BlockList />,
    },
  ];

  const content = (
    <div className="flex h-full flex-col bg-[var(--ide-sidebar-bg)]">
      <div className="border-b border-[var(--ide-border)] px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ide-text-muted)]">
            ASSETS
          </span>
          <span className="text-[10px] text-[var(--ide-text-muted)]">Drag & Drop</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 p-1">
        <Tabs
          defaultActiveKey="component-list"
          items={items}
          className="h-full [&>.ant-tabs-nav]:mb-1 [&>.ant-tabs-nav]:px-2 [&>.ant-tabs-nav::before]:border-b-[var(--ide-border)] [&>.ant-tabs-content-holder]:h-[calc(100%-40px)] [&>.ant-tabs-content-holder_.ant-tabs-content]:h-full [&>.ant-tabs-content-holder_.ant-tabs-tabpane]:h-full [&_.ant-tabs-tab]:px-2 [&_.ant-tabs-tab]:py-1 [&_.ant-tabs-tab]:text-[12px] [&_.ant-tabs-tab-active]:text-[var(--ide-text)] [&_.ant-tabs-ink-bar]:bg-[var(--ide-accent)]"
        />
      </div>
    </div>
  );

  return <div className="flex h-full min-w-0 flex-1 flex-col">{content}</div>;
}
