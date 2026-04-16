import { Tabs } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import ComponentList from "./ComponentList";

interface EditorLeftPanelProps {
  embedded?: boolean;
}

export default function EdiotLeftPanel({
  embedded = false,
}: EditorLeftPanelProps) {
  if (embedded) {
    return (
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden bg-[#252526]">
        <div className="flex items-center justify-between border-b border-[#3c3c3c] px-4 py-2">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb]">组件</div>
          </div>
          <span className="flex h-6 w-6 items-center justify-center text-[#858585]">
            <AppstoreOutlined />
          </span>
        </div>
        <div className="min-h-0 flex-1 px-1 py-1">
          <ComponentList />
        </div>
      </div>
    );
  }

  const items = [
    {
      key: "component-list",
      label: (
        <span className="flex items-center gap-2">
          <AppstoreOutlined /> <span>组件列表</span>
        </span>
      ),
      children: <ComponentList />,
    },
  ];

  const content = (
    <div className="flex h-full flex-col bg-[#252526]">
      <div className="border-b border-[#3c3c3c] px-4 py-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb]">
            ASSETS
          </span>
          <span className="text-[10px] text-[#858585]">Drag & Drop</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 p-1">
        <Tabs
          defaultActiveKey="component-list"
          items={items}
          className="h-full [&>.ant-tabs-nav]:mb-1 [&>.ant-tabs-nav]:px-2 [&>.ant-tabs-nav::before]:border-b-[#3c3c3c] [&>.ant-tabs-content-holder]:h-[calc(100%-40px)] [&>.ant-tabs-content-holder_.ant-tabs-content]:h-full [&>.ant-tabs-content-holder_.ant-tabs-tabpane]:h-full [&_.ant-tabs-tab]:px-2 [&_.ant-tabs-tab]:py-1 [&_.ant-tabs-tab]:text-[12px] [&_.ant-tabs-tab-active]:text-white [&_.ant-tabs-ink-bar]:bg-[#0e639c]"
        />
      </div>
    </div>
  );

  return <div className="flex h-full min-w-0 flex-1 flex-col">{content}</div>;
}
