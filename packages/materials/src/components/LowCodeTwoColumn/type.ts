import type {
  TBasicComponentConfig,
  TransformedComponentConfig,
} from "@codigo/schema";

export interface ITwoColumnComponentProps {
  title: string;
  leftWidth: number;
  gap: number;
  minHeight: number;
  backgroundColor: string;
}

export type TTwoColumnComponentConfig = TBasicComponentConfig<
  "twoColumn",
  ITwoColumnComponentProps
>;

export type TTwoColumnComponentConfigResult =
  TransformedComponentConfig<ITwoColumnComponentProps>;

export const twoColumnComponentDefaultConfig: TTwoColumnComponentConfigResult = {
  title: {
    value: "双栏布局",
    defaultValue: "双栏布局",
    isHidden: false,
  },
  leftWidth: {
    value: 260,
    defaultValue: 260,
    isHidden: false,
  },
  gap: {
    value: 16,
    defaultValue: 16,
    isHidden: false,
  },
  minHeight: {
    value: 320,
    defaultValue: 320,
    isHidden: false,
  },
  backgroundColor: {
    value: "#ffffff",
    defaultValue: "#ffffff",
    isHidden: false,
  },
};
