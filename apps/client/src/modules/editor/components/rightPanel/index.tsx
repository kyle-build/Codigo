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
import { useEditorComponents, useEditorPage } from "@/modules/editor/hooks";

export default function EditorRightPanel() {
  const { store: storePage } = useEditorPage();
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
      key: "page-fields",
      label: (
        <Tooltip title="全局属性" placement="bottom">
          <div className="flex h-8 w-8 items-center justify-center rounded-sm transition-all">
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
          <div className="flex h-8 w-8 items-center justify-center rounded-sm transition-all">
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
          <div className="flex h-8 w-8 items-center justify-center rounded-sm transition-all">
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
    <div className="flex h-full min-h-0 w-full flex-col bg-[#252526]">
      <div className="border-b border-[#3c3c3c] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#858585]">
            MODE: {storePage.editorMode}
          </span>
        </div>
      </div>

      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        items={items}
        centered
        className="editor-right-tabs flex min-h-0 flex-1 flex-col [&>.ant-tabs-nav]:mb-0 [&>.ant-tabs-nav]:shrink-0 [&>.ant-tabs-nav::before]:border-b-[#3c3c3c] [&>.ant-tabs-content-holder]:min-h-0 [&>.ant-tabs-content-holder]:flex-1 [&>.ant-tabs-content-holder]:overflow-y-auto [&>.ant-tabs-content-holder]:px-3 [&>.ant-tabs-content-holder]:py-2 [&>.ant-tabs-content-holder]:scrollbar-thin [&>.ant-tabs-content-holder]:scrollbar-thumb-[#3c3c3c] hover:[&>.ant-tabs-content-holder]:scrollbar-thumb-[#454545] [&>.ant-tabs-content-holder]:scrollbar-track-transparent [&_.ant-tabs-content]:h-full [&_.ant-tabs-content]:min-h-0 [&_.ant-tabs-tabpane]:h-full [&_.ant-tabs-tabpane]:min-h-0 [&_.ant-tabs-nav-list]:gap-0 [&_.ant-tabs-tab]:!m-0 [&_.ant-tabs-tab]:!p-2 [&_.ant-tabs-tab-active]:text-white [&_.ant-tabs-ink-bar]:bg-[#0e639c]"
      />
    </div>
  );
}
