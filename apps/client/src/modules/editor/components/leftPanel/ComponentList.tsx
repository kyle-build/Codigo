import { SearchOutlined } from "@ant-design/icons";
import { Collapse, Empty, Input } from "antd";
import { getComponentContainerMeta } from "@codigo/materials";
import type { DragEvent, FC } from "react";
import { useMemo, useState } from "react";
import {
  useStoreComponents,
  useStorePage,
  useStorePermission,
} from "@/shared/hooks";
import {
  editorComponentCatalog,
  getEditorComponentSections,
  type EditorComponentMeta,
} from "@/modules/editor/registry/components";

export const components = editorComponentCatalog;

const EditorComponent: FC<EditorComponentMeta> = ({ icon, name, type }) => {
  const store = useStoreComponents();
  const { can } = useStorePermission();
  const allowInsert = can("edit_structure");

  function handleClick() {
    if (!allowInsert) return;
    const current = store.getCurrentComponentConfig.get();
    if (current) {
      const meta = getComponentContainerMeta(current.type);
      if (meta.isContainer) {
        const slotName =
          store.getAvailableSlots(current.type)[0]?.name ?? "default";
        store.push(
          type,
          { left: 24, top: 24 },
          { parentId: current.id, slot: slotName },
        );
        return;
      }
    }
    store.push(type);
  }

  function handleDragStart(e: DragEvent) {
    if (!allowInsert) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("componentType", type);
    e.dataTransfer.effectAllowed = "copy";
  }

  return (
    <div
      onClick={handleClick}
      draggable={allowInsert}
      onDragStart={handleDragStart}
      className={`group relative overflow-hidden rounded-[18px] border p-3 text-left select-none transition-all ${
        allowInsert
          ? "cursor-grab border-slate-200/80 bg-white hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/80 hover:shadow-[0_18px_32px_-28px_rgba(16,185,129,0.85)] active:cursor-grabbing"
          : "cursor-not-allowed border-slate-100 bg-slate-50 opacity-55"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/60 to-emerald-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="pointer-events-none mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-base text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
        {icon}
      </div>
      <div className="pointer-events-none space-y-1">
        <div className="text-xs font-medium text-slate-500">{name}</div>
      </div>
    </div>
  );
};

export default function ComponentList() {
  const [keyword, setKeyword] = useState("");
  const { store: storePage } = useStorePage();
  const normalizedKeyword = keyword.trim().toLowerCase();

  const filteredSections = useMemo(
    () =>
      getEditorComponentSections(storePage.pageCategory)
        .map((section) => ({
          ...section,
          items: normalizedKeyword
            ? section.items.filter((item) =>
                `${item.name} ${item.type}`
                  .toLowerCase()
                  .includes(normalizedKeyword),
              )
            : section.items,
        }))
        .filter((section) => section.items.length > 0),
    [normalizedKeyword, storePage.pageCategory],
  );

  const collapseItems = filteredSections.map((section) => ({
    key: section.key,
    label: (
      <div className="flex items-center justify-between pr-2">
        <span className="font-medium text-slate-700">{section.label}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-400">
          {section.items.length}
        </span>
      </div>
    ),
    children: (
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {section.items.map((item) => (
          <EditorComponent {...item} key={item.type} />
        ))}
      </div>
    ),
  }));

  return (
    <div className="flex h-full flex-col">
      <div className="px-2.5 pb-2.5">
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索组件名称或类型"
          prefix={<SearchOutlined className="text-slate-400" />}
          allowClear
          size="small"
          className="!rounded-xl !border-slate-200 !bg-slate-50/80"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2.5 pb-3 scrollbar-thin scrollbar-thumb-slate-200/60 hover:scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {collapseItems.length ? (
          <Collapse
            defaultActiveKey={filteredSections.map((section) => section.key)}
            ghost
            items={collapseItems}
            expandIconPosition="end"
            className="[&_.ant-collapse-item]:mb-2.5 [&_.ant-collapse-item]:rounded-[18px] [&_.ant-collapse-item]:border [&_.ant-collapse-item]:border-slate-100 [&_.ant-collapse-item]:bg-slate-50/60 [&_.ant-collapse-header]:!items-center [&_.ant-collapse-header]:!px-3.5 [&_.ant-collapse-header]:!py-2.5 [&_.ant-collapse-header]:text-[13px] [&_.ant-collapse-content-box]:!px-3.5 [&_.ant-collapse-content-box]:!pb-3.5 [&_.ant-collapse-content-box]:!pt-1"
          />
        ) : (
          <div className="rounded-[22px] border border-dashed border-slate-200 bg-slate-50/70 py-10">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="没有匹配的组件"
            />
          </div>
        )}
      </div>
    </div>
  );
}
