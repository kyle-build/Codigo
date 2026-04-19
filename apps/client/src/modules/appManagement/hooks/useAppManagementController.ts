import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useMemo, useState } from "react";
import { useRequest } from "ahooks";
import { message } from "antd";
import type { MenuProps } from "antd";
import { createElement } from "react";
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
import type { TemplateListItem } from "@codigo/schema";
import {
  buildTemplateSchema,
  writeTemplateToDraft,
} from "@/modules/templateCenter/utils/templateDraft";
import { fetchTemplateDetail, fetchTemplateList } from "@/modules/templateCenter/api/templates";

export function useAppManagementController() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isLogin, logout, store: storeAuth } = useStoreAuth();
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const isLoggedIn = Boolean(storeAuth.token);

  const userMenuItems = useMemo<MenuProps["items"]>(
    () => [
      {
        key: "profile",
        icon: createElement(UserOutlined),
        label: "个人中心",
        onClick: () => navigate("/?modal=profile"),
      },
      {
        key: "logout",
        icon: createElement(LogoutOutlined),
        label: "退出登录",
        onClick: () => {
          logout();
          navigate("/?modal=login");
        },
      },
    ],
    [logout, navigate],
  );

  const openLogin = () => navigate("/?modal=login");

  const { data: templates = [], loading: templatesLoading } = useRequest(
    fetchTemplateList,
  );

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

  const handleOpenTemplatePreview = async (template: TemplateListItem) => {
    await openPreview(async () => {
      const detail = await fetchTemplateDetail(template.id);
      return {
        title: detail.preset.name,
        subtitle: `${detail.preset.deviceType === "mobile" ? "移动端" : "PC 端"} · ${detail.preset.pages.length} 个页面 · 画布 ${detail.preset.canvasWidth} × ${detail.preset.canvasHeight}`,
        schema: buildTemplateSchema(detail.preset),
      };
    });
  };

  const handleUseTemplate = async (template: TemplateListItem) => {
    if (!isLoggedIn) {
      message.info("访客仅可查看模板内容，登录后可将模板载入编辑器");
      return;
    }

    const detail = await fetchTemplateDetail(template.id);
    writeTemplateToDraft(detail.preset);
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
    avatarUrl: storeAuth.details?.head_img,
    currentTab,
    handleOpenPublishedPage,
    handleOpenTemplatePreview,
    handleOpenVersion,
    handleTabChange,
    handleUseTemplate,
    isLoggedIn: isLogin.get(),
    localDraftMeta,
    myPageData,
    myPageLoading,
    openLogin,
    previewLoading,
    previewState,
    publicLoading,
    publicPages,
    setPreviewState,
    templates,
    templatesLoading,
    userMenuItems,
    username: storeAuth.details?.username,
  };
}
