import { useState } from "react";
import {
  AppstoreOutlined,
  CheckOutlined,
  CodeOutlined,
  DownOutlined,
} from "@ant-design/icons";
import type { PostReleaseRequest } from "@codigo/materials";
import type { MenuProps } from "antd";
import { useRequest } from "ahooks";
import { Button, Dropdown, message, Space } from "antd";
import { observer } from "mobx-react-lite";
import {
  postRelease,
  updatePublishedPageConfig,
} from "@/modules/editor/api/low-code";
import { PublishReleaseModal } from "@/modules/editor/components/header/center/PublishReleaseModal";
import { PublishTemplateModal } from "@/modules/editor/components/header/center/PublishTemplateModal";
import type { PublishReleaseModalValues } from "@/modules/editor/components/header/center/publishReleaseModal.config";
import {
  useEditorComponents,
  useEditorPage,
  useEditorPermission,
} from "@/modules/editor/hooks";
import {
  buildTemplatePresetFromEditor,
  createTemplateKeySuggestion,
} from "@/modules/editor/utils/publishTemplate";
import { createTemplate } from "@/modules/templateCenter/api/templates";
import { useStoreAuth } from "@/shared/hooks/useStoreAuth";

export const PublishButton = observer(function PublishButton() {
  const { serializeSchema } = useEditorComponents();
  const { store } = useEditorPage();
  const { addOperationLog, can, ensurePermission } = useEditorPermission();
  const { store: authStore } = useStoreAuth();
  const [publishResult, setPublishResult] = useState({
    pageId: 0,
    open: false,
    shareUrl: "",
    pageName: "",
  });
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [templateInitialValues, setTemplateInitialValues] = useState({
    name: "",
    key: "",
    desc: "",
    tags: "",
  });
  const { run: runPublish, loading: publishLoading } = useRequest(
    async (values: PostReleaseRequest) => postRelease(values),
    {
      manual: true,
      onSuccess: ({ data }) => {
        const shareUrl = buildReleaseShareUrl(Number(data));
        setPublishResult({
          pageId: Number(data),
          open: true,
          shareUrl,
          pageName: store.title?.trim() || "未命名应用",
        });
        localStorage.setItem("release_time", String(Date.now()));
      },
    },
  );
  const { runAsync: runCreateTemplate, loading: templateLoading } = useRequest(
    createTemplate,
    {
      manual: true,
    },
  );
  const { runAsync: runUpdateReleaseConfig, loading: publishConfigLoading } =
    useRequest(
      async (values: PublishReleaseModalValues) => {
        if (!publishResult.pageId) {
          throw new Error("缺少发布页面编号");
        }
        const expireAt =
          values.expirePreset === "never"
            ? null
            : values.expirePreset === "7d"
              ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
              : values.expirePreset === "30d"
                ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                : values.expireAt?.toISOString() ?? null;

        return updatePublishedPageConfig(publishResult.pageId, {
          visibility: values.visibility,
          expire_at: expireAt,
        });
      },
      {
        manual: true,
      },
    );
  const canPublish = can("publish");
  const canPublishTemplate =
    canPublish &&
    (authStore.details?.global_role === "SUPER_ADMIN" ||
      authStore.details?.global_role === "ADMIN");
  const isBusy = publishLoading || templateLoading;

  /**
   * 构建直接发布接口所需的页面快照。
   */
  function buildReleasePayload(): PostReleaseRequest {
    return {
      desc: store.description,
      page_name: store.title,
      schema: serializeSchema(),
      schema_version: 2,
      tdk: store.tdk,
      pageCategory: store.pageCategory,
      layoutMode: store.layoutMode,
      grid: store.grid,
      shellLayout: store.shellLayout,
      deviceType: store.deviceType,
      canvasWidth: store.canvasWidth,
      canvasHeight: store.canvasHeight,
    };
  }

  /**
   * 生成当前环境下可分享的发布链接。
   */
  function buildReleaseShareUrl(pageId: number) {
    if (typeof window === "undefined") {
      return "";
    }
    const base = window.location.href.split("#")[0];
    return `${base}#/release/${pageId}`;
  }

  /**
   * 将输入的标签字符串清洗为模板标签数组。
   */
  function parseTemplateTags(tags: string) {
    return Array.from(
      new Set(
        tags
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      ),
    );
  }

  /**
   * 直接发布当前页面。
   */
  function handlePublish() {
    if (!ensurePermission("publish", "当前角色没有发布权限")) {
      return;
    }

    runPublish(buildReleasePayload());
    addOperationLog("publish", store.title);
  }

  /**
   * 保存发布链接的可见性和过期策略。
   */
  async function handleSubmitPublishResult(values: PublishReleaseModalValues) {
    await runUpdateReleaseConfig(values);
    message.success("发布配置已保存");
    setPublishResult((prev) => ({
      ...prev,
      open: false,
    }));
  }

  /**
   * 打开模板发布弹窗，并生成一份默认表单值。
   */
  function handleOpenTemplateModal() {
    if (!ensurePermission("publish", "当前角色没有发布权限")) {
      return;
    }
    if (!canPublishTemplate) {
      message.warning("仅管理员可发布为模板");
      return;
    }

    const fallbackTitle = store.title?.trim() || "未命名模板";
    setTemplateInitialValues({
      name: fallbackTitle,
      key: createTemplateKeySuggestion(fallbackTitle),
      desc: store.description?.trim() || `基于“${fallbackTitle}”生成的模板`,
      tags: store.pageCategory,
    });
    setTemplateModalOpen(true);
  }

  /**
   * 将当前编辑器内容发布为模板。
   */
  async function handlePublishTemplate(values: {
    name: string;
    key: string;
    desc: string;
    tags: string;
  }) {
    if (!ensurePermission("publish", "当前角色没有发布权限")) {
      return;
    }
    if (!canPublishTemplate) {
      message.warning("仅管理员可发布为模板");
      return;
    }

    const preset = buildTemplatePresetFromEditor({
      key: values.key.trim().toLowerCase(),
      name: values.name.trim(),
      desc: values.desc.trim(),
      tags: parseTemplateTags(values.tags),
      pageTitle: store.title?.trim() || values.name.trim(),
      pageCategory: store.pageCategory,
      layoutMode: store.layoutMode,
      grid: store.grid,
      shellLayout: store.shellLayout,
      deviceType: store.deviceType,
      canvasWidth: store.canvasWidth,
      canvasHeight: store.canvasHeight,
      schema: serializeSchema(),
    });

    await runCreateTemplate({
      preset,
      status: "published",
    });
    addOperationLog("publish_template", preset.name);
    setTemplateModalOpen(false);
    message.success(`模板“${preset.name}”已发布`);
  }

  const publishMenu: MenuProps = {
    items: [
      {
        key: "publish",
        icon: <CodeOutlined />,
        label: "直接发布",
      },
      {
        key: "template",
        icon: <AppstoreOutlined />,
        label: canPublishTemplate ? "发布为模板" : "发布为模板（仅管理员）",
        disabled: !canPublishTemplate,
      },
    ],
    onClick: ({ key }) => {
      if (key === "template") {
        handleOpenTemplateModal();
        return;
      }
      handlePublish();
    },
  };

  return (
    <>
      <Space.Compact>
        <Button
          loading={publishLoading}
          className="!h-6 !rounded-s-sm !rounded-e-none !border-none !bg-[var(--ide-accent)] !px-2 !text-[11px] !font-medium !text-white hover:opacity-90"
          type="primary"
          onClick={handlePublish}
          disabled={!canPublish || templateLoading}
        >
          <CodeOutlined />
          发布
          <CheckOutlined />
        </Button>
        <Dropdown menu={publishMenu} trigger={["click"]} placement="bottomRight">
          <Button
            className="!h-6 !rounded-s-none !rounded-e-sm !border-none !bg-[var(--ide-accent)] !px-1.5 !text-[11px] !text-white hover:opacity-90"
            type="primary"
            disabled={!canPublish || isBusy}
            aria-label="打开发布菜单"
          >
            <DownOutlined />
          </Button>
        </Dropdown>
      </Space.Compact>
      <PublishTemplateModal
        open={templateModalOpen}
        loading={templateLoading}
        initialValues={templateInitialValues}
        onCancel={() => setTemplateModalOpen(false)}
        onSubmit={handlePublishTemplate}
      />
      <PublishReleaseModal
        open={publishResult.open}
        loading={publishConfigLoading}
        shareUrl={publishResult.shareUrl}
        pageName={publishResult.pageName}
        onSubmit={handleSubmitPublishResult}
        onCancel={() =>
          setPublishResult((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </>
  );
});
