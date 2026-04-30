import { useState } from "react";
import { Empty, Tabs, Tooltip } from "antd";
import {
  AppstoreOutlined,
  ThunderboltOutlined,
} from "@ant-design/icons";
import ComponentFields from "./component-fields";
import { toJS } from "mobx";
import type { ActionConfig } from "@codigo/schema";
import { ActionListEditor } from "./action-list-editor";
import { useEditorComponents, useEditorPage } from "@/modules/editor/hooks";
import { observer } from "mobx-react-lite";

function ComponentEventsPanel() {
  const { getCurrentComponentConfig, getPages, updateCurrentComponentEvents } =
    useEditorComponents();
  const config = getCurrentComponentConfig.get();

  if (!config) {
    return (
      <div className="py-8 text-center">
        <div className="mb-3 text-[12px] font-medium text-[var(--ide-text)]">
          暂未选中组件
        </div>
        <div className="mb-4 text-[11px] leading-relaxed text-[var(--ide-text-muted)]">
          在画布中点击组件进行配置
        </div>
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={false}
          className="!mb-0 !mt-2"
        />
      </div>
    );
  }

  const pageOptions = getPages.get().map((page) => ({
    label: `${page.name} · page:${page.path}`,
    value: `page:${page.path}`,
  }));
  const eventActions = (toJS(config.events?.onClick) ?? []) as ActionConfig[];

  return (
    <div className="space-y-2 px-3 pb-8">
      <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-hover)] p-2">
        <ActionListEditor
        value={eventActions}
        onChange={(actions) => updateCurrentComponentEvents("onClick", actions)}
        pageOptions={pageOptions}
        emptyText="无事件步骤"
      />
      </div>
    </div>
  );
}

const ComponentEventsPanelComponent = observer(ComponentEventsPanel);

export default function EditorRightPanel() {
  const { store: pageStore } = useEditorPage();
  const { store: storeComps } = useEditorComponents();
  const [activeKey, setActiveKey] = useState("components-fields");

  const items = [
    {
      key: "components-fields",
      label: (
        <Tooltip title="组件属性" placement="bottom">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm transition-all">
            <AppstoreOutlined className="text-base" />
          </div>
        </Tooltip>
      ),
      children: <ComponentFields store={storeComps} />,
    },
    {
      key: "events",
      label: (
        <Tooltip title="事件" placement="bottom">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm transition-all">
            <ThunderboltOutlined className="text-base" />
          </div>
        </Tooltip>
      ),
      children: <ComponentEventsPanelComponent />,
    },
  ];

  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[var(--ide-sidebar-bg)]">
      <div className="border-b border-[var(--ide-border)] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ide-text-muted)]">
            MODE: {pageStore.editorMode}
          </span>
        </div>
      </div>

      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        items={items}
        centered
        className="editor-right-tabs flex min-h-0 flex-1 flex-col [&>.ant-tabs-nav]:mb-0 [&>.ant-tabs-nav]:shrink-0 [&>.ant-tabs-nav::before]:border-b-[var(--ide-border)] [&>.ant-tabs-content-holder]:min-h-0 [&>.ant-tabs-content-holder]:flex-1 [&>.ant-tabs-content-holder]:overflow-y-auto [&>.ant-tabs-content-holder]:px-3 [&>.ant-tabs-content-holder]:py-2 [&>.ant-tabs-content-holder]:scrollbar-thin [&>.ant-tabs-content-holder]:scrollbar-thumb-[var(--ide-border)] hover:[&>.ant-tabs-content-holder]:scrollbar-thumb-[var(--ide-text-muted)] [&>.ant-tabs-content-holder]:scrollbar-track-transparent [&_.ant-tabs-content]:h-full [&_.ant-tabs-content]:min-h-0 [&_.ant-tabs-tabpane]:h-full [&_.ant-tabs-tabpane]:min-h-0 [&_.ant-tabs-nav-list]:gap-0 [&_.ant-tabs-tab]:!m-0 [&_.ant-tabs-tab]:!p-2 [&_.ant-tabs-tab-active]:text-[var(--ide-text)] [&_.ant-tabs-ink-bar]:bg-[var(--ide-accent)]"
      />
    </div>
  );
}
