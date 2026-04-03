import { useState } from "react";
import { Tabs, Tooltip } from "antd";
import {
  AppstoreOutlined,
  SettingOutlined,
  RobotOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import ComponentFields from "./ComponentFields";
import GlobalFields from "./GlobalFields";
import AIChatPanel from "./AIChatPanel";
import PermissionPanel from "./PermissionPanel";
import { useStoreComponents, useStorePage } from "@/shared/hooks";

export default function EditorRightPanel() {
  const { store: storePage } = useStorePage();
  const { store: storeComps } = useStoreComponents();
  const [activeKey, setActiveKey] = useState("components-fields");

  const items = [
    {
      key: "components-fields",
      label: (
        <Tooltip title="组件属性" placement="bottom">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl transition-all">
            <AppstoreOutlined className="text-base" />
          </div>
        </Tooltip>
      ),
      children: <ComponentFields store={storeComps} />,
    },
    {
      key: "page-fields",
      label: (
        <Tooltip title="全局属性" placement="bottom">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl transition-all">
            <SettingOutlined className="text-base" />
          </div>
        </Tooltip>
      ),
      children: <GlobalFields store={storePage} />,
    },
    {
      key: "ai-chat",
      label: (
        <Tooltip title="AI生成" placement="bottom">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl transition-all">
            <RobotOutlined className="text-base" />
          </div>
        </Tooltip>
      ),
      children: <AIChatPanel />,
    },
    {
      key: "permission",
      label: (
        <Tooltip title="协作权限" placement="bottom">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl transition-all">
            <TeamOutlined className="text-base" />
          </div>
        </Tooltip>
      ),
      children: <PermissionPanel />,
    },
  ];

  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-transparent">
      <div className="border-b border-slate-200/80 px-4 py-4">
        <div className="mb-1.5 flex items-center gap-2">
          <span className="text-[11px] text-slate-400">
            {storePage.editorMode}
          </span>
        </div>
      </div>

      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        items={items}
        centered
        className="editor-right-tabs flex min-h-0 flex-1 flex-col [&>.ant-tabs-nav]:mb-0 [&>.ant-tabs-nav]:shrink-0 [&>.ant-tabs-nav]:px-2.5 [&>.ant-tabs-nav]:pt-2.5 [&>.ant-tabs-nav::before]:border-b-slate-100 [&>.ant-tabs-content-holder]:min-h-0 [&>.ant-tabs-content-holder]:flex-1 [&>.ant-tabs-content-holder]:overflow-y-auto [&>.ant-tabs-content-holder]:px-4 [&>.ant-tabs-content-holder]:py-3 [&>.ant-tabs-content-holder]:scrollbar-thin [&>.ant-tabs-content-holder]:scrollbar-thumb-slate-200/60 hover:[&>.ant-tabs-content-holder]:scrollbar-thumb-slate-300 [&>.ant-tabs-content-holder]:scrollbar-track-transparent [&_.ant-tabs-content]:h-full [&_.ant-tabs-content]:min-h-0 [&_.ant-tabs-tabpane]:h-full [&_.ant-tabs-tabpane]:min-h-0 [&_.ant-tabs-nav-list]:gap-1 [&_.ant-tabs-tab]:!m-0 [&_.ant-tabs-tab]:!p-0.5 [&_.ant-tabs-tab-active_div]:bg-emerald-500/10 [&_.ant-tabs-tab-active_div]:text-emerald-600 [&_.ant-tabs-tab-active_div]:shadow-[0_10px_24px_-18px_rgba(16,185,129,0.9)] [&_.ant-tabs-ink-bar]:bg-emerald-500"
      />
    </div>
  );
}
