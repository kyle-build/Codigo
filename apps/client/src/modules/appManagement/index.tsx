import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
import { templates } from "@/modules/templateCenter/data/templatePresets";
import { TemplatePreviewModal } from "@/modules/templateCenter/components/TemplatePreviewModal";
import { useAppManagementController } from "./hooks/useAppManagementController";
import { useAppManagementViewModel } from "./hooks/useAppManagementViewModel";
import AppManagementFootnote from "./components/layout/AppManagementFootnote";
import AppManagementHero from "./components/layout/AppManagementHero";
import AppManagementPage from "./components/layout/AppManagementPage";
import AppManagementWorkspace from "./components/layout/AppManagementWorkspace";
import AppManagementSectionContent from "./components/sections/AppManagementSectionContent";

const AppManagement = observer(() => {
  const navigate = useNavigate();
  const {
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
  } = useAppManagementController();
  const { metrics, navigationItems } = useAppManagementViewModel({
    isLoggedIn,
    isUpdatedAfterPublish: localDraftMeta?.isUpdatedAfterPublish,
    publicLoading,
    publicPagesCount: publicPages.length,
    versionsCount: myPageData?.versions.length ?? 0,
  });

  return (
    <>
      <AppManagementPage
        footer={<AppManagementFootnote />}
        hero={<AppManagementHero isLoggedIn={isLoggedIn} metrics={metrics} />}
        isLoggedIn={isLoggedIn}
      >
        <AppManagementWorkspace
          currentTab={currentTab}
          items={navigationItems}
          onChange={handleTabChange}
        >
          <AppManagementSectionContent
            currentTab={currentTab}
            draftMeta={localDraftMeta}
            isLoggedIn={isLoggedIn}
            myPageData={myPageData}
            myPageLoading={myPageLoading}
            publicLoading={publicLoading}
            publicPages={publicPages}
            templates={templates}
            onContinue={() =>
              navigate(
                myPageData?.page?.id ? `/editor?id=${myPageData.page.id}` : "/editor",
              )
            }
            onPreviewPublished={handleOpenPublishedPage}
            onPreviewTemplate={handleOpenTemplatePreview}
            onPreviewVersion={handleOpenVersion}
            onUseTemplate={handleUseTemplate}
          />
        </AppManagementWorkspace>
      </AppManagementPage>
      <TemplatePreviewModal
        loading={previewLoading}
        open={Boolean(previewState)}
        title={previewState?.title}
        subtitle={previewState?.subtitle}
        schema={previewState?.schema ?? null}
        onClose={() => setPreviewState(null)}
      />
    </>
  );
});

export default AppManagement;
