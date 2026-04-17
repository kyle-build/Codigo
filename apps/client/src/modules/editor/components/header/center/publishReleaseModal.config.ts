import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

export type ReleaseVisibility = "public" | "private";
export type ReleaseExpirePreset = "never" | "7d" | "30d" | "custom";

export interface PublishReleaseModalValues {
  visibility: ReleaseVisibility;
  expirePreset: ReleaseExpirePreset;
  expireAt: Dayjs | null;
}

export const DEFAULT_PUBLISH_RELEASE_VALUES: PublishReleaseModalValues = {
  visibility: "public",
  expirePreset: "never",
  expireAt: null,
};

/**
 * 生成当前过期策略的摘要文案。
 */
export function buildExpireSummary(values: PublishReleaseModalValues) {
  if (values.expirePreset === "never") {
    return "永久有效";
  }
  if (values.expirePreset === "7d") {
    return `7 天后过期 · ${dayjs().add(7, "day").format("YYYY-MM-DD HH:mm")}`;
  }
  if (values.expirePreset === "30d") {
    return `30 天后过期 · ${dayjs().add(30, "day").format("YYYY-MM-DD HH:mm")}`;
  }
  return values.expireAt
    ? `自定义过期 · ${values.expireAt.format("YYYY-MM-DD HH:mm")}`
    : "请选择过期时间";
}
