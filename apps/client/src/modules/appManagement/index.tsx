import { observer } from "mobx-react-lite";
import { useNavigate } from "react-router-dom";
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
    avatarUrl,
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
    openLogin,
    previewLoading,
    previewState,
    publicLoading,
    publicPages,
    setPreviewState,
    templates,
    userMenuItems,
    username,
  } = useAppManagementController();
  const { metrics, navigationItems } = useAppManagementViewModel({
    isLoggedIn,
    isUpdatedAfterPublish: localDraftMeta?.isUpdatedAfterPublish,
    publicLoading,
    publicPagesCount: publicPages.length,
    templatesCount: templates.length,
    versionsCount: myPageData?.versions.length ?? 0,
  });

  return (
    <>
      <AppManagementPage
        avatarUrl={avatarUrl}
        isLoggedIn={isLoggedIn}
        openLogin={openLogin}
        userMenuItems={userMenuItems}
        username={username}
      >
        <AppManagementWorkspace
          currentTab={currentTab}
          footer={<AppManagementFootnote />}
          hero={<AppManagementHero isLoggedIn={isLoggedIn} metrics={metrics} />}
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
