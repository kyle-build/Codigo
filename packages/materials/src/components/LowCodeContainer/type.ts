import type {
  TBasicComponentConfig,
  TransformedComponentConfig,
} from "@codigo/schema";

export interface IContainerComponentProps {
  title: string;
  backgroundColor: string;
  borderColor: string;
  borderRadius: number;
  padding: number;
  minHeight: number;
}

export type TContainerComponentConfig = TBasicComponentConfig<
  "container",
  IContainerComponentProps
>;

export type TContainerComponentConfigResult =
  TransformedComponentConfig<IContainerComponentProps>;

export const containerComponentDefaultConfig: TContainerComponentConfigResult = {
  title: {
    value: "容器",
    defaultValue: "容器",
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
    value: 24,
    defaultValue: 24,
    isHidden: false,
  },
  minHeight: {
    value: 240,
    defaultValue: 240,
    isHidden: false,
  },
};
