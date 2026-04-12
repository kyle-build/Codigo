import { useMemo, useState } from "react";
import { AppstoreOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import { templates } from "../data/templatePresets";
import type { TemplatePreset } from "../types/templates";
import { buildTemplateSchema } from "../utils/templateDraft";
import { TemplateGallery } from "./TemplateGallery";
import { TemplatePreviewModal } from "./TemplatePreviewModal";

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
  const [previewKey, setPreviewKey] = useState<string | null>(null);
  const previewTemplate = useMemo(
    () => templates.find((item) => item.key === previewKey) ?? null,
    [previewKey],
  );

  return (
    <>
      <Modal
        destroyOnClose
        footer={null}
        open={open}
        title={
          <div className="flex items-center gap-2">
            <AppstoreOutlined className="text-emerald-500" />
            <span>模板库</span>
          </div>
        }
        width={1080}
        onCancel={onClose}
      >
        <div className="mb-5 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
          在编辑器内直接预览并应用模板，默认覆盖当前页面画布内容，不需要再返回应用管理。
        </div>
        <TemplateGallery
          canUseTemplate={canUseTemplate}
          templates={templates}
          onPreview={(template) => setPreviewKey(template.key)}
          onUse={onUse}
        />
      </Modal>
      <TemplatePreviewModal
        open={Boolean(previewTemplate)}
        title={previewTemplate?.name}
        subtitle={
          previewTemplate
            ? `${previewTemplate.deviceType === "mobile" ? "移动端" : "PC 端"} · 画布 ${previewTemplate.canvasWidth} × ${previewTemplate.canvasHeight}`
            : undefined
        }
        schema={previewTemplate ? buildTemplateSchema(previewTemplate) : null}
        onClose={() => setPreviewKey(null)}
      />
    </>
  );
}
