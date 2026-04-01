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
      title: "组件属性",
      description: "聚焦当前选中组件的内容、样式与结构配置。",
      label: (
        <Tooltip title="组件属性" placement="bottom">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl transition-all">
            <AppstoreOutlined className="text-lg" />
          </div>
        </Tooltip>
      ),
      children: <ComponentFields store={storeComps} />,
    },
    {
      key: "page-fields",
      title: "全局属性",
      description: "调整页面标题、SEO 以及图表主题等全局信息。",
      label: (
        <Tooltip title="全局属性" placement="bottom">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl transition-all">
            <SettingOutlined className="text-lg" />
          </div>
        </Tooltip>
      ),
      children: <GlobalFields store={storePage} />,
    },
    {
      key: "ai-chat",
      title: "AI 生成",
      description: "通过自然语言快速补齐页面结构、文案和交互想法。",
      label: (
        <Tooltip title="AI生成" placement="bottom">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl transition-all">
            <RobotOutlined className="text-lg" />
          </div>
        </Tooltip>
      ),
      children: <AIChatPanel />,
    },
    {
      key: "permission",
      title: "协作权限",
      description: "管理协作者、权限角色与多人编辑状态。",
      label: (
        <Tooltip title="协作权限" placement="bottom">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl transition-all">
            <TeamOutlined className="text-lg" />
          </div>
        </Tooltip>
      ),
      children: <PermissionPanel />,
    },
  ];

  const handleTabChange = (key: string) => {
    setActiveKey(key);
  };

  const activeItem = items.find((item) => item.key === activeKey) ?? items[0];

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-transparent">
      <div className="border-b border-slate-200/80 px-5 py-5">
        <div className="mb-2 flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Inspector
          </span>
          <span className="text-xs text-slate-400">{storePage.editorMode}</span>
        </div>
        <h3 className="text-base font-semibold text-slate-900">
          {activeItem.title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {activeItem.description}
        </p>
      </div>

      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        items={items}
        centered
        className="editor-right-tabs flex min-h-0 flex-1 flex-col [&>.ant-tabs-nav]:mb-0 [&>.ant-tabs-nav]:shrink-0 [&>.ant-tabs-nav]:px-3 [&>.ant-tabs-nav]:pt-3 [&>.ant-tabs-nav::before]:border-b-slate-100 [&>.ant-tabs-content-holder]:min-h-0 [&>.ant-tabs-content-holder]:flex-1 [&>.ant-tabs-content-holder]:overflow-y-auto [&>.ant-tabs-content-holder]:px-5 [&>.ant-tabs-content-holder]:py-4 [&>.ant-tabs-content-holder]:scrollbar-thin [&>.ant-tabs-content-holder]:scrollbar-thumb-slate-200/60 hover:[&>.ant-tabs-content-holder]:scrollbar-thumb-slate-300 [&>.ant-tabs-content-holder]:scrollbar-track-transparent [&_.ant-tabs-content]:h-full [&_.ant-tabs-content]:min-h-0 [&_.ant-tabs-tabpane]:h-full [&_.ant-tabs-tabpane]:min-h-0 [&_.ant-tabs-nav-list]:gap-1 [&_.ant-tabs-tab]:!m-0 [&_.ant-tabs-tab]:!p-1 [&_.ant-tabs-tab-active_div]:bg-emerald-500/10 [&_.ant-tabs-tab-active_div]:text-emerald-600 [&_.ant-tabs-tab-active_div]:shadow-[0_10px_24px_-18px_rgba(16,185,129,0.9)] [&_.ant-tabs-ink-bar]:bg-emerald-500"
      />
    </div>
  );
}
