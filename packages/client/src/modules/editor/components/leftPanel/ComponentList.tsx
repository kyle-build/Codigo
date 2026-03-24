import {
  BorderOutlined,
  CheckCircleOutlined,
  CheckSquareOutlined,
  CreditCardOutlined,
  DashboardOutlined,
  EditOutlined,
  ExpandOutlined,
  // FontColorsOutlined,
  FontSizeOutlined,
  FormOutlined,
  FundViewOutlined,
  MinusOutlined,
  PlaySquareOutlined,
  SplitCellsOutlined,
  UnorderedListOutlined,
  WarningOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { Collapse } from "antd";
import type { FC, ReactNode } from "react";
import { useStoreComponents, useStorePermission } from "@/shared/hooks";

// 基础组件配置数组
const basicComponents = [
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
  // {
  //   type: "richText",
  //   name: "富文本组件",
  //   icon: <FontColorsOutlined />,
  // },
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

// 表单组件配置数组
const formComponents = [
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

// 报表组件配置数组
const reportComponents = [
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
];

// 导出所有组件配置，用于其他地方引用
export const components = [
  ...basicComponents,
  ...formComponents,
  ...reportComponents,
];

interface ComponentProps {
  name: string;
  icon: ReactNode;
  type: string;
}

// 公共样式组件
const EditorComponent: FC<ComponentProps> = ({ icon, name, type }) => {
  const store = useStoreComponents();
  const { can } = useStorePermission();
  const allowInsert = can("edit_structure");
  // 将要展示的组件类型告诉 store
  function handleClick() {
    if (!allowInsert) return;
    // @ts-ignore
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
      className={`group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 p-4 text-xs text-gray-400 select-none transition-all ${
        allowInsert
          ? "cursor-grab hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-white hover:shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:-translate-y-1 active:cursor-grabbing"
          : "cursor-not-allowed opacity-45"
      }`}
    >
      <div className="text-xl text-emerald-500/70 group-hover:text-emerald-400 transition-colors pointer-events-none">
        {icon}
      </div>
      <span className="font-medium pointer-events-none">{name}</span>
    </div>
  );
};

// 不同组件列表
export default function ComponentList() {
  const items = [
    {
      key: "basic",
      label: "基础组件",
      children: (
        <div className="grid grid-cols-2 gap-3">
          {basicComponents.map((item, index) => (
            <EditorComponent {...item} key={index} />
          ))}
        </div>
      ),
    },
    {
      key: "form",
      label: "表单组件",
      children: (
        <div className="grid grid-cols-2 gap-3">
          {formComponents.map((item, index) => (
            <EditorComponent {...item} key={index} />
          ))}
        </div>
      ),
    },
    {
      key: "report",
      label: "报表组件",
      children: (
        <div className="grid grid-cols-2 gap-3">
          {reportComponents.map((item, index) => (
            <EditorComponent {...item} key={index} />
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="component-list">
      <Collapse
        defaultActiveKey={["basic", "form", "report"]}
        ghost
        items={items}
        expandIconPosition="end"
      />
    </div>
  );
}
