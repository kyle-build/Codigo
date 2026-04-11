import type { TComponentTypes } from "@codigo/schema";

const layoutGapX = 380;
const layoutGapY = 200;
const layoutStartX = 32;
const layoutStartY = 24;

/**
 * 计算组件的默认宽度。
 */
export function getDefaultWidthByType(type: TComponentTypes): string {
  switch (type) {
    case "twoColumn":
      return "960px";
    case "container":
      return "720px";
    case "table":
    case "card":
    case "list":
    case "image":
    case "video":
    case "swiper":
    case "richText":
      return "420px";
    case "input":
    case "button":
    case "textArea":
    case "radio":
    case "checkbox":
    case "statistic":
      return "360px";
    case "split":
      return "520px";
    default:
      return "320px";
  }
}

/**
 * 估算组件在初次插入时的默认高度。
 */
export function getDefaultHeightByType(type: TComponentTypes): number {
  switch (type) {
    case "twoColumn":
      return 420;
    case "container":
      return 240;
    case "table":
    case "dataTable":
    case "list":
    case "cardGrid":
      return 320;
    case "image":
    case "video":
    case "swiper":
      return 240;
    case "button":
      return 48;
    case "input":
    case "textArea":
    case "radio":
    case "checkbox":
      return 56;
    default:
      return 160;
  }
}

/**
 * 计算组件在画布中的默认位置。
 */
export function getDefaultPosition(index: number) {
  return {
    left: `${layoutStartX + (index % 3) * layoutGapX}px`,
    top: `${layoutStartY + Math.floor(index / 3) * layoutGapY}px`,
  };
}
