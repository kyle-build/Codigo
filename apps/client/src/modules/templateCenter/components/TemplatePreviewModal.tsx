import { Modal, Spin } from "antd";
import type { TemplatePreviewSchema } from "../utils/preview";
import { renderSchemaOutline } from "../utils/preview";

interface TemplatePreviewModalProps {
  loading?: boolean;
  onClose: () => void;
  open: boolean;
  schema: TemplatePreviewSchema | null;
  subtitle?: string;
  title?: string;
}

export function TemplatePreviewModal({
  loading = false,
  onClose,
  open,
  schema,
  subtitle,
  title,
}: TemplatePreviewModalProps) {
  return (
    <Modal
      destroyOnClose
      footer={null}
      open={open}
      title={title}
      width={760}
      onCancel={onClose}
    >
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spin />
        </div>
      ) : schema ? (
        <div className="space-y-5">
          {subtitle ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              {subtitle}
            </div>
          ) : null}
          {renderSchemaOutline({ nodes: schema.components })}
        </div>
      ) : null}
    </Modal>
  );
}
