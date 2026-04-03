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
      <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden rounded-[22px] border border-slate-200/80 bg-white/90 shadow-[0_18px_36px_-32px_rgba(15,23,42,0.45)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-slate-900">组件</div>
            <div className="mt-1 text-[11px] text-slate-400">
              拖拽或点击插入画布
            </div>
          </div>
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
            <AppstoreOutlined />
          </span>
        </div>
        <div className="min-h-0 flex-1 px-1 py-2">
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
    <>
      <div className="rounded-[22px] border border-slate-200/70 bg-[linear-gradient(135deg,rgba(16,185,129,0.12),rgba(255,255,255,0.98))] px-3.5 py-3 shadow-[0_18px_35px_-28px_rgba(16,185,129,0.85)]">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Assets
          </span>
          <span className="text-[11px] text-slate-500">Drag & Drop</span>
        </div>
      </div>

      <div className="min-h-0 flex-1 rounded-[22px] border border-slate-200/70 bg-white/80 p-1 shadow-[0_20px_40px_-34px_rgba(15,23,42,0.5)] backdrop-blur-xl">
        <Tabs
          defaultActiveKey="component-list"
          items={items}
          className="h-full [&>.ant-tabs-nav]:mb-2 [&>.ant-tabs-nav]:px-2.5 [&>.ant-tabs-nav]:pt-2.5 [&>.ant-tabs-nav::before]:border-b-slate-100 [&>.ant-tabs-content-holder]:h-[calc(100%-48px)] [&>.ant-tabs-content-holder_.ant-tabs-content]:h-full [&>.ant-tabs-content-holder_.ant-tabs-tabpane]:h-full [&_.ant-tabs-tab]:rounded-lg [&_.ant-tabs-tab]:px-2.5 [&_.ant-tabs-tab]:py-1.5 [&_.ant-tabs-tab]:text-[13px] [&_.ant-tabs-tab-active]:bg-emerald-500/8 [&_.ant-tabs-tab-active]:text-emerald-600 [&_.ant-tabs-ink-bar]:bg-emerald-500"
        />
      </div>
    </>
  );

  return <div className="flex h-full min-w-0 flex-1 flex-col gap-3">{content}</div>;
}
