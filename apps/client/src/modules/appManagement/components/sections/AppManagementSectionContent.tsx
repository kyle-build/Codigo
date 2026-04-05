import type { AppManagementTab, LocalDraftMeta, MyPagePayload, PageVersionItem, PublicPageItem } from "../../types/appManagement";
import type { TemplatePreset } from "../../types/templates";
import DevelopingSection from "./DevelopingSection";
import HistorySection from "./HistorySection";
import PublishedSection from "./PublishedSection";
import TemplateSection from "./TemplateSection";

interface AppManagementSectionContentProps {
  currentTab: AppManagementTab;
  draftMeta: LocalDraftMeta | null;
  isLoggedIn: boolean;
  myPageData?: MyPagePayload;
  myPageLoading: boolean;
  onContinue: () => void;
  onPreviewPublished: (
    pageId: number,
    title: string,
    subtitle: string,
  ) => void | Promise<void>;
  onPreviewTemplate: (template: TemplatePreset) => void;
  onPreviewVersion: (version: PageVersionItem) => void | Promise<void>;
  onUseTemplate: (template: TemplatePreset) => void;
  publicLoading: boolean;
  publicPages: PublicPageItem[];
  templates: TemplatePreset[];
}

function AppManagementSectionContent({
  currentTab,
  draftMeta,
  isLoggedIn,
  myPageData,
  myPageLoading,
  onContinue,
  onPreviewPublished,
  onPreviewTemplate,
  onPreviewVersion,
  onUseTemplate,
  publicLoading,
  publicPages,
  templates,
}: AppManagementSectionContentProps) {
  if (currentTab === "developing") {
    return (
      <DevelopingSection
        draftMeta={draftMeta}
        loading={myPageLoading}
        myPageData={myPageData}
        onContinue={onContinue}
      />
    );
  }

  if (currentTab === "versions") {
    return (
      <HistorySection
        loading={myPageLoading}
        versions={myPageData?.versions ?? []}
        onPreview={onPreviewVersion}
      />
    );
  }

  if (currentTab === "templates") {
    return (
      <TemplateSection
        isLoggedIn={isLoggedIn}
        templates={templates}
        onPreview={onPreviewTemplate}
        onUse={onUseTemplate}
      />
    );
  }

  return (
    <PublishedSection
      isLoggedIn={isLoggedIn}
      loading={myPageLoading}
      myPageData={myPageData}
      publicLoading={publicLoading}
      publicPages={publicPages}
      onPreview={onPreviewPublished}
    />
  );
}

export default AppManagementSectionContent;
