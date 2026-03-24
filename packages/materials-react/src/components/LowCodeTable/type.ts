import type {
  TBasicComponentConfig,
  TransformedComponentConfig,
} from "@codigo/schema";

export interface ITableComponentProps {
  title: string;
  size: "large" | "middle" | "small";
  bordered: boolean;
  pagination: boolean;
  pageSize: number;
  columnsText: string;
  dataText: string;
}

export type TTableComponentConfig = TBasicComponentConfig<
  "table",
  ITableComponentProps
>;

export type TTableComponentConfigResult =
  TransformedComponentConfig<ITableComponentProps>;

const defaultColumns = [
  { title: "用户名", dataIndex: "name" },
  { title: "角色", dataIndex: "role" },
  { title: "状态", dataIndex: "status" },
];

const defaultData = [
  { key: "u_1", name: "张三", role: "管理员", status: "启用" },
  { key: "u_2", name: "李四", role: "运营", status: "停用" },
  { key: "u_3", name: "王五", role: "财务", status: "启用" },
];

export const tableComponentDefaultConfig: TTableComponentConfigResult = {
  title: {
    value: "用户列表",
    defaultValue: "用户列表",
    isHidden: false,
  },
  size: {
    value: "middle",
    defaultValue: "middle",
    isHidden: false,
  },
  bordered: {
    value: true,
    defaultValue: true,
    isHidden: false,
  },
  pagination: {
    value: true,
    defaultValue: true,
    isHidden: false,
  },
  pageSize: {
    value: 10,
    defaultValue: 10,
    isHidden: false,
  },
  columnsText: {
    value: JSON.stringify(defaultColumns, null, 2),
    defaultValue: JSON.stringify(defaultColumns, null, 2),
    isHidden: false,
  },
  dataText: {
    value: JSON.stringify(defaultData, null, 2),
    defaultValue: JSON.stringify(defaultData, null, 2),
    isHidden: false,
  },
};
