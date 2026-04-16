import { SearchOutlined } from "@ant-design/icons";
import { Collapse, Empty, Input } from "antd";
import { getComponentContainerMeta } from "@codigo/materials";
import type { DragEvent, FC } from "react";
import { useMemo, useState } from "react";
import {
  useEditorComponents,
  useEditorPage,
  useEditorPermission,
} from "@/modules/editor/hooks";
import {
  editorComponentCatalog,
  getEditorComponentSections,
  type EditorComponentMeta,
} from "@/modules/editor/registry/components";

export const components = editorComponentCatalog;

const EditorComponent: FC<EditorComponentMeta> = ({ icon, name, type }) => {
  const store = useEditorComponents();
  const { can } = useEditorPermission();
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
      className={`group relative overflow-hidden border p-2 text-left select-none transition-all ${
        allowInsert
          ? "cursor-grab border-[#3c3c3c] bg-[#2d2d2d] hover:border-[#0e639c] hover:bg-[#37373d] active:cursor-grabbing"
          : "cursor-not-allowed border-[#2d2d2d] bg-[#252526] opacity-40"
      }`}
    >
      <div className="pointer-events-none mb-1.5 flex h-7 w-7 items-center justify-center rounded-sm bg-[#3c3c3c] text-sm text-[#cccccc] transition-colors group-hover:bg-[#0e639c] group-hover:text-white">
        {icon}
      </div>
      <div className="pointer-events-none">
        <div className="truncate text-[11px] font-medium text-[#bbbbbb]">{name}</div>
      </div>
    </div>
  );
};

export default function ComponentList() {
  const [keyword, setKeyword] = useState("");
  const { store: storePage } = useEditorPage();
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
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#bbbbbb]">{section.label}</span>
        <span className="text-[10px] text-[#858585]">
          {section.items.length}
        </span>
      </div>
    ),
    children: (
      <div className="grid grid-cols-2 gap-1.5">
        {section.items.map((item) => (
          <EditorComponent {...item} key={item.type} />
        ))}
      </div>
    ),
  }));

  return (
    <div className="flex h-full flex-col bg-[#252526]">
      <div className="px-2 pb-2">
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索组件..."
          prefix={<SearchOutlined className="text-[#858585]" />}
          allowClear
          size="small"
          className="!rounded-sm !border-[#3c3c3c] !bg-[#3c3c3c] !text-[#cccccc]"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 scrollbar-thin scrollbar-thumb-[#3c3c3c] hover:scrollbar-thumb-[#454545] scrollbar-track-transparent">
        {collapseItems.length ? (
          <Collapse
            defaultActiveKey={filteredSections.map((section) => section.key)}
            ghost
            items={collapseItems}
            expandIconPosition="end"
            className="[&_.ant-collapse-item]:mb-1 [&_.ant-collapse-item]:border-b [&_.ant-collapse-item]:border-[#3c3c3c] [&_.ant-collapse-header]:!items-center [&_.ant-collapse-header]:!px-2 [&_.ant-collapse-header]:!py-1.5 [&_.ant-collapse-header]:text-[12px] [&_.ant-collapse-content-box]:!px-1 [&_.ant-collapse-content-box]:!pb-2 [&_.ant-collapse-content-box]:!pt-1"
          />
        ) : (
          <div className="border border-dashed border-[#3c3c3c] bg-[#2d2d2d] py-10">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={<span className="text-[#858585]">无匹配组件</span>}
            />
          </div>
        )}
      </div>
    </div>
  );
}
