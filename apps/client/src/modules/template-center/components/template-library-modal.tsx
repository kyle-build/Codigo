import { useEffect, useMemo, useState } from "react";
import { useRequest } from "ahooks";
import { AppstoreOutlined } from "@ant-design/icons";
import { Modal, Spin, message } from "antd";
import type { TemplateDetailResponse, TemplateListItem } from "@codigo/schema";
import type { TemplatePreset } from "../types/templates";
import { fetchTemplateDetail, fetchTemplateList } from "../api/templates";
import { buildTemplateSchema } from "../utils/template-draft";
import { TemplateGallery } from "./template-gallery";
import { TemplatePreviewModal } from "./template-preview-modal";

interface TemplateLibraryModalProps {
  canUseTemplate: boolean;
  onClose: () => void;
  onUse: (template: TemplatePreset) => void;
  open: boolean;
}

export function TemplateLibraryModal({
  canUseTemplate,
  onClose,
  onUse,
  open,
}: TemplateLibraryModalProps) {
  const [previewId, setPreviewId] = useState<number | null>(null);
  const [previewDetail, setPreviewDetail] = useState<TemplateDetailResponse | null>(
    null,
  );

  const {
    data: templates = [],
    loading: listLoading,
  } = useRequest(() => fetchTemplateList(), {
    ready: open,
  });

  const { runAsync: loadDetail, loading: detailLoading } = useRequest(
    (id: number) => fetchTemplateDetail(id),
    { manual: true },
  );

  const previewTemplate = useMemo(
    () => templates.find((item) => item.id === previewId) ?? null,
    [previewId, templates],
  );

  useEffect(() => {
    if (!previewId) {
      setPreviewDetail(null);
      return;
    }

    loadDetail(previewId)
      .then((detail) => setPreviewDetail(detail))
      .catch(() => {
        message.error("模板加载失败");
        setPreviewDetail(null);
      });
  }, [loadDetail, previewId]);

  const handlePreview = (template: TemplateListItem) => {
    setPreviewId(template.id);
  };

  const handleUse = async (template: TemplateListItem) => {
    try {
      const detail = await loadDetail(template.id);
      onUse(detail.preset as TemplatePreset);
    } catch {
      message.error("模板加载失败");
    }
  };

  return (
    <>
      <Modal
        destroyOnHidden
        footer={null}
        open={open}
        title={
          <div className="flex items-center gap-2">
            <AppstoreOutlined className="text-[var(--ide-accent)]" />
            <span>模板库</span>
          </div>
        }
        width={1080}
        onCancel={onClose}
      >
        <div className="mb-5 rounded-md border border-[var(--ide-border)] bg-[var(--ide-hover)] px-4 py-3 text-sm text-[var(--ide-text-muted)]">
          在编辑器内直接预览并应用模板
        </div>
        {listLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spin />
          </div>
        ) : (
          <TemplateGallery
            canUseTemplate={canUseTemplate}
            templates={templates}
            onPreview={handlePreview}
            onUse={handleUse}
          />
        )}
      </Modal>
      <TemplatePreviewModal
        loading={detailLoading}
        open={Boolean(previewId)}
        title={previewTemplate?.name}
        subtitle={
          previewTemplate
            ? `${previewTemplate.deviceType === "mobile" ? "移动端" : "PC 端"} · ${previewTemplate.pagesCount} 个页面 · 画布 ${previewTemplate.canvasWidth} × ${previewTemplate.canvasHeight}`
            : undefined
        }
        schema={previewDetail ? buildTemplateSchema(previewDetail.preset) : null}
        onClose={() => setPreviewId(null)}
      />
    </>
  );
}
