import { useMemo, useState } from "react";
import { useRequest } from "ahooks";
import { message } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useStoreAuth } from "@/shared/hooks";
import {
  fetchMyPageData,
  fetchPublicPages,
  fetchPublishedPreview,
  fetchVersionPreview,
  getLocalDraftMeta,
} from "../api";
import type {
  AppManagementTab,
  PageVersionItem,
  PreviewState,
} from "../types/appManagement";
import type { TemplatePreset } from "@/modules/templateCenter/types/templates";
import {
  buildTemplateSchema,
  writeTemplateToDraft,
} from "@/modules/templateCenter/utils/templateDraft";

export function useAppManagementController() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { store: storeAuth } = useStoreAuth();
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const isLoggedIn = Boolean(storeAuth.token);

  const { data: publicPages = [], loading: publicLoading } = useRequest(
    fetchPublicPages,
  );

  const { data: myPageData, loading: myPageLoading } = useRequest(
    fetchMyPageData,
    {
      ready: isLoggedIn,
      refreshDeps: [isLoggedIn, storeAuth.details?.id],
    },
  );

  const { runAsync: openPreview, loading: previewLoading } = useRequest(
    async (task: () => Promise<PreviewState>) => {
      const nextState = await task();
      setPreviewState(nextState);
    },
    {
      manual: true,
    },
  );

  const localDraftMeta = useMemo(
    () => getLocalDraftMeta(isLoggedIn, Boolean(myPageData?.page)),
    [isLoggedIn, myPageData?.page],
  );

  const availableTabs = useMemo<AppManagementTab[]>(
    () =>
      isLoggedIn
        ? ["developing", "published", "versions", "templates"]
        : ["published", "templates"],
    [isLoggedIn],
  );

  const currentTab = availableTabs.includes(
    (searchParams.get("tab") ?? "") as AppManagementTab,
  )
    ? (searchParams.get("tab") as AppManagementTab)
    : availableTabs[0];

  const handleTabChange = (tab: AppManagementTab) => {
    setSearchParams({ tab });
  };

  const handleOpenTemplatePreview = (template: TemplatePreset) => {
    setPreviewState({
      title: template.name,
      subtitle: `${template.deviceType === "mobile" ? "移动端" : "PC 端"} · 画布 ${template.canvasWidth} × ${template.canvasHeight}`,
      schema: buildTemplateSchema(template),
    });
  };

  const handleUseTemplate = (template: TemplatePreset) => {
    if (!isLoggedIn) {
      message.info("访客仅可查看模板内容，登录后可将模板载入编辑器");
      return;
    }

    writeTemplateToDraft(template);
    navigate("/editor");
  };

  const handleOpenPublishedPage = async (
    pageId: number,
    title: string,
    subtitle: string,
  ) => {
    await openPreview(() => fetchPublishedPreview(pageId, title, subtitle));
  };

  const handleOpenVersion = async (version: PageVersionItem) => {
    await openPreview(() => fetchVersionPreview(version));
  };

  return {
    availableTabs,
    currentTab,
    handleOpenPublishedPage,
    handleOpenTemplatePreview,
    handleOpenVersion,
    handleTabChange,
    handleUseTemplate,
    isLoggedIn,
    localDraftMeta,
    myPageData,
    myPageLoading,
    previewLoading,
    previewState,
    publicLoading,
    publicPages,
    setPreviewState,
  };
}
