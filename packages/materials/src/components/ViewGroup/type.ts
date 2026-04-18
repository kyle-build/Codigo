import type {
  TBasicComponentConfig,
  TransformedComponentConfig,
} from "@codigo/schema";

export interface ViewGroupContainerItem {
  id: string;
  name: string;
}

export interface IViewGroupComponentProps {
  containers?: ViewGroupContainerItem[];
  defaultActiveId?: string;
  activeId?: string;
  contentUseGrid: boolean;
  contentGridCols: number;
  contentGridRows: number;
  contentGridGap: number;
  backgroundColor: string;
  borderColor: string;
  borderRadius: number;
  padding: number;
  minHeight: number;
  visibleStateKey: string;
  visibleStateValue: string;
}

export type TViewGroupComponentConfig = TBasicComponentConfig<
  "viewGroup",
  IViewGroupComponentProps
>;

export type TViewGroupComponentConfigResult =
  TransformedComponentConfig<IViewGroupComponentProps>;

export const viewGroupComponentDefaultConfig: TViewGroupComponentConfigResult = {
  containers: {
    value: [],
    defaultValue: [],
    isHidden: false,
  },
  defaultActiveId: {
    value: "",
    defaultValue: "",
    isHidden: false,
  },
  activeId: {
    value: "",
    defaultValue: "",
    isHidden: true,
  },
  contentUseGrid: {
    value: false,
    defaultValue: false,
    isHidden: false,
  },
  contentGridCols: {
    value: 12,
    defaultValue: 12,
    isHidden: false,
  },
  contentGridRows: {
    value: 12,
    defaultValue: 12,
    isHidden: false,
  },
  contentGridGap: {
    value: 8,
    defaultValue: 8,
    isHidden: false,
  },
  backgroundColor: {
    value: "#ffffff",
    defaultValue: "#ffffff",
    isHidden: false,
  },
  borderColor: {
    value: "#d9d9d9",
    defaultValue: "#d9d9d9",
    isHidden: false,
  },
  borderRadius: {
    value: 16,
    defaultValue: 16,
    isHidden: false,
  },
  padding: {
    value: 16,
    defaultValue: 16,
    isHidden: false,
  },
  minHeight: {
    value: 240,
    defaultValue: 240,
    isHidden: false,
  },
  visibleStateKey: {
    value: "",
    defaultValue: "",
    isHidden: false,
  },
  visibleStateValue: {
    value: "",
    defaultValue: "",
    isHidden: false,
  },
};
