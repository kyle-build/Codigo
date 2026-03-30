import {
  LayoutOutlined,
  BorderOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  EditOutlined,
  ExpandOutlined,
  FontColorsOutlined,
  FontSizeOutlined,
  FormOutlined,
  FundViewOutlined,
  MinusOutlined,
  PlaySquareOutlined,
  SplitCellsOutlined,
  UnorderedListOutlined,
  WarningOutlined,
  TableOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
} from "@ant-design/icons";
import { Collapse, Empty, Input } from "antd";
import type { TComponentTypes } from "@codigo/schema";
import { getComponentContainerMeta } from "@codigo/materials";
import type { FC, ReactNode } from "react";
import { useMemo, useState } from "react";
import { useStoreComponents, useStorePermission } from "@/shared/hooks";

interface ComponentProps {
  name: string;
  icon: ReactNode;
  type: TComponentTypes;
}

const basicComponents: ComponentProps[] = [
  {
    type: "container",
    name: "容器组件",
    icon: <LayoutOutlined />,
  },
  {
    type: "twoColumn",
    name: "双栏布局组件",
    icon: <LayoutOutlined />,
  },
  {
    type: "button",
    name: "按钮组件",
    icon: <BorderOutlined />,
  },
  {
    type: "video",
    name: "视频组件",
    icon: <PlaySquareOutlined />,
  },
  {
    type: "swiper",
    name: "轮播组件",
    icon: <SplitCellsOutlined />,
  },
  {
    type: "card",
    name: "卡片组件",
    icon: <CreditCardOutlined />,
  },
  {
    type: "list",
    name: "列表组件",
    icon: <UnorderedListOutlined />,
  },
  {
    type: "image",
    name: "图片组件",
    icon: <FundViewOutlined />,
  },
  {
    type: "titleText",
    name: "文本组件",
    icon: <FontSizeOutlined />,
  },
  {
    type: "split",
    name: "分割组件",
    icon: <MinusOutlined />,
  },
  {
    type: "richText",
    name: "富文本组件",
    icon: <FontColorsOutlined />,
  },
  {
    type: "empty",
    name: "空状态组件",
    icon: <ExpandOutlined />,
  },
  {
    type: "alert",
    name: "警告信息组件",
    icon: <WarningOutlined />,
  },
];

const formComponents: ComponentProps[] = [
  {
    type: "input",
    name: "输入框组件",
    icon: <EditOutlined />,
  },
  {
    type: "textArea",
    name: "文本域组件",
    icon: <FormOutlined />,
  },
  {
    type: "radio",
    name: "单选框组件",
    icon: <CheckCircleOutlined />,
  },
  {
    type: "checkbox",
    name: "多选框组件",
    icon: <CheckSquareOutlined />,
  },
];

const reportComponents: ComponentProps[] = [
  {
    type: "statistic",
    name: "统计指标组件",
    icon: <DashboardOutlined />,
  },
  {
    type: "table",
    name: "表格组件",
    icon: <TableOutlined />,
  },
  {
    type: "barChart",
    name: "柱状图组件",
    icon: <BarChartOutlined />,
  },
  {
    type: "lineChart",
    name: "折线图组件",
    icon: <LineChartOutlined />,
  },
  {
    type: "pieChart",
    name: "饼图组件",
    icon: <PieChartOutlined />,
  },
];

export const components = [
  ...basicComponents,
  ...formComponents,
  ...reportComponents,
];

const EditorComponent: FC<ComponentProps> = ({ icon, name, type }) => {
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

  function handleDragStart(e: React.DragEvent) {
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
      className={`group relative overflow-hidden rounded-2xl border p-4 text-left select-none transition-all ${
        allowInsert
          ? "cursor-grab border-slate-200/80 bg-white hover:-translate-y-1 hover:border-emerald-300 hover:bg-emerald-50/80 hover:shadow-[0_20px_35px_-28px_rgba(16,185,129,0.85)] active:cursor-grabbing"
          : "cursor-not-allowed border-slate-100 bg-slate-50 opacity-55"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/60 to-emerald-500/0 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="pointer-events-none mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-lg text-emerald-600 transition-colors group-hover:bg-emerald-500 group-hover:text-white">
        {icon}
      </div>
      <div className="pointer-events-none space-y-1">
        <div className="text-sm font-semibold text-slate-900">{name}</div>
        <div className="text-[11px] text-slate-400">
          {allowInsert ? "点击添加或拖入画布" : "当前角色无编辑权限"}
        </div>
      </div>
    </div>
  );
};

export default function ComponentList() {
  const [keyword, setKeyword] = useState("");
  const normalizedKeyword = keyword.trim().toLowerCase();

  const sections = [
    {
      key: "basic",
      label: "基础组件",
      items: basicComponents,
    },
    {
      key: "form",
      label: "表单组件",
      items: formComponents,
    },
    {
      key: "report",
      label: "报表组件",
      items: reportComponents,
    },
  ];

  const filteredSections = useMemo(
    () =>
      sections
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
    [normalizedKeyword],
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
      <div className="px-3 pb-3">
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="搜索组件名称或类型"
          prefix={<SearchOutlined className="text-slate-400" />}
          allowClear
          className="!rounded-2xl !border-slate-200 !bg-slate-50/80"
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin scrollbar-thumb-slate-200/60 hover:scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {collapseItems.length ? (
          <Collapse
            defaultActiveKey={filteredSections.map((section) => section.key)}
            ghost
            items={collapseItems}
            expandIconPosition="end"
            className="[&_.ant-collapse-item]:mb-3 [&_.ant-collapse-item]:rounded-2xl [&_.ant-collapse-item]:border [&_.ant-collapse-item]:border-slate-100 [&_.ant-collapse-item]:bg-slate-50/60 [&_.ant-collapse-header]:!items-center [&_.ant-collapse-header]:!px-4 [&_.ant-collapse-header]:!py-3 [&_.ant-collapse-content-box]:!px-4 [&_.ant-collapse-content-box]:!pb-4 [&_.ant-collapse-content-box]:!pt-1"
          />
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 py-12">
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
