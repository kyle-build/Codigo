import dayjs from "dayjs";
import {
  getLowCodePage,
  getPageVersionDetail,
  getPageVersions,
  getPublicPages,
  getPublishedPage,
} from "@/modules/editor/api/low-code";
import type {
  LocalDraftMeta,
  MyPagePayload,
  PageVersionItem,
  PreviewState,
  PublicPageItem,
} from "../types/appManagement";
import { resolveSchemaFromReleasePayload } from "@/modules/templateCenter/utils/preview";

export async function fetchPublicPages() {
  const res = await getPublicPages();
  return (res.data ?? []) as PublicPageItem[];
}

export async function fetchMyPageData() {
  const pageRes = await getLowCodePage();
  const page = pageRes.data;

  if (!page?.id) {
    return {
      page: null,
      versions: [],
    } satisfies MyPagePayload;
  }

  const versionRes = await getPageVersions(page.id);

  return {
    page,
    versions: (versionRes.data ?? []) as PageVersionItem[],
  } satisfies MyPagePayload;
}

export async function fetchPublishedPreview(
  pageId: number,
  title: string,
  subtitle: string,
) {
  const res = await getPublishedPage(pageId);

  return {
    title,
    subtitle,
    schema: resolveSchemaFromReleasePayload(res.data),
  } satisfies PreviewState;
}

export async function fetchVersionPreview(version: PageVersionItem) {
  const res = await getPageVersionDetail(version.page_id, version.id);

  return {
    title: `历史版本 v${version.version}`,
    subtitle: dayjs(version.created_at).format("YYYY-MM-DD HH:mm"),
    schema: resolveSchemaFromReleasePayload(res.data?.schema_data),
  } satisfies PreviewState;
}

export function getLocalDraftMeta(
  isLoggedIn: boolean,
  hasPage: boolean,
): LocalDraftMeta | null {
  if (!isLoggedIn || typeof window === "undefined") {
    return null;
  }

  const schema = window.localStorage.getItem("pageSchema");
  const storeTime = Number(window.localStorage.getItem("store_time") ?? 0);
  const releaseTime = Number(window.localStorage.getItem("release_time") ?? 0);
  const hasDraft = Boolean(schema);
  const isUpdatedAfterPublish = hasDraft && storeTime >= releaseTime;

  if (!hasDraft && !hasPage) {
    return null;
  }

  return {
    hasDraft,
    isUpdatedAfterPublish,
    updatedAt: storeTime ? dayjs(storeTime).format("YYYY-MM-DD HH:mm") : "暂无",
  };
}
