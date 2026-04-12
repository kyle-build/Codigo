import {
  AppstoreOutlined,
  DragOutlined,
  HighlightOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import { EditorTemplateLibraryTrigger } from "@/modules/editor/components/template/EditorTemplateLibraryTrigger";
import { quickInsertComponents } from "@/modules/editor/registry/components";
import type { TComponentTypes } from "@codigo/schema";

const emptyStateSteps = [
  {
    key: "container",
    icon: <DragOutlined />,
    title: "添加容器",
  },
  {
    key: "edit",
    icon: <HighlightOutlined />,
    title: "拖入组件",
  },
  {
    key: "preview",
    icon: <PlusOutlined />,
    title: "套用模板",
  },
];

interface CanvasEmptyStateProps {
  canEditStructure: boolean;
  onQuickInsert: (type: TComponentTypes) => void;
}

export function CanvasEmptyState({
  canEditStructure,
  onQuickInsert,
}: CanvasEmptyStateProps) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-10">
      <div className="pointer-events-auto relative w-full max-w-2xl overflow-hidden rounded-[32px] border border-dashed border-emerald-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(240,253,250,0.96))] p-8 text-center shadow-[0_30px_70px_-40px_rgba(16,185,129,0.45)] backdrop-blur-xl">
        <div className="absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/80 to-transparent" />
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[22px] bg-emerald-500/10 text-3xl text-emerald-600">
          <AppstoreOutlined />
        </div>
        <div className="text-base font-semibold text-slate-900">
          先添加容器组件，再开始搭建
        </div>
        <div className="mt-2 text-sm text-slate-500">
          可以直接套用后台模板起稿，或者从左侧资源库拖入容器后继续自由搭建。
        </div>
        <div className="mt-6 grid grid-cols-3 gap-3 text-left">
          {emptyStateSteps.map((item) => (
            <div
              key={item.key}
              className="rounded-2xl border border-white bg-white/90 px-4 py-4 shadow-[0_18px_36px_-32px_rgba(15,23,42,0.55)]"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-lg text-emerald-600">
                {item.icon}
              </div>
              <div className="text-sm font-semibold text-slate-900">
                {item.title}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <EditorTemplateLibraryTrigger variant="empty" />
          {quickInsertComponents.map((item) => (
            <Button
              key={item.type}
              type="default"
              icon={<PlusOutlined />}
              disabled={!canEditStructure}
              className="!h-10 !rounded-2xl !border-slate-200 !bg-white !px-4 hover:!border-emerald-300 hover:!text-emerald-600"
              onClick={() => onQuickInsert(item.type)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <div className="mt-5 text-xs text-slate-400">
          {canEditStructure
            ? "支持直接应用模板，也支持从左侧资源库添加容器后继续拖拽业务组件"
            : "当前角色没有新增组件权限"}
        </div>
      </div>
    </div>
  );
}
