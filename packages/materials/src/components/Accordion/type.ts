import type {
  TBasicComponentConfig,
  TransformedComponentConfig,
} from "@codigo/schema";

export interface IAccordionItem {
  id: string;
  title: string;
  content: string;
}

export interface IAccordionComponentProps {
  id: string;
  accordion: boolean;
  ghost: boolean;
  items: IAccordionItem[];
}

export type TAccordionComponentConfig = TBasicComponentConfig<
  "accordion",
  IAccordionComponentProps
>;

export type TAccordionComponentConfigResult =
  TransformedComponentConfig<IAccordionComponentProps>;

export const accordionItemDefaultValue: IAccordionItem = {
  id: "",
  title: "手风琴标题",
  content: "这里是手风琴内容，支持输入多段说明。",
};

export const accordionComponentDefaultConfig: TAccordionComponentConfigResult = {
  id: {
    value: "",
    defaultValue: "",
    isHidden: true,
  },
  accordion: {
    value: true,
    defaultValue: true,
    isHidden: false,
  },
  ghost: {
    value: false,
    defaultValue: false,
    isHidden: false,
  },
  items: {
    value: [accordionItemDefaultValue],
    defaultValue: [accordionItemDefaultValue],
    isHidden: false,
  },
};
