import type { FC } from "react";
import {
  ButtonComponentProps,
  ImageComponentProps,
  SwiperComponentProps,
  VideoComponentProps,
  CardComponentProps,
  ListComponentProps,
  StatisticComponentProps,
  TableComponentProps,
  TextComponentProps,
  SplitComponentProps,
  EmptyComponentProps,
  RichTextComponentProps,
  QrcodeComponentProps,
  AlertComponentProps,
  InputComponentProps,
  CheckboxComponentProps,
  RadioComponentProps,
} from "..";
import type { TBasicComponentConfig, TComponentTypes } from "@codigo/schema";

// @ts-ignore
export const componentPropsList: Record<TComponentTypes, FC<any>> = {
  button: ButtonComponentProps,
  video: VideoComponentProps,
  image: ImageComponentProps,
  swiper: SwiperComponentProps,
  card: CardComponentProps,
  list: ListComponentProps,
  statistic: StatisticComponentProps,
  table: TableComponentProps,
  titleText: TextComponentProps,
  split: SplitComponentProps,
  empty: EmptyComponentProps,
  richText: RichTextComponentProps,
  qrcode: QrcodeComponentProps,
  alert: AlertComponentProps,
  input: InputComponentProps,
  textArea: InputComponentProps,
  radio: RadioComponentProps,
  checkbox: CheckboxComponentProps,
};

export function getComponentPropsByType(type: TBasicComponentConfig["type"]) {
  return componentPropsList[type];
}












