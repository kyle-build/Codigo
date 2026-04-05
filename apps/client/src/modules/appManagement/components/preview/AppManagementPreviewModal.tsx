import { Modal, Spin } from "antd";
import type { Dispatch, SetStateAction } from "react";
import type { PreviewState } from "../../types/appManagement";
import { renderSchemaOutline } from "../../utils/preview";

interface AppManagementPreviewModalProps {
  loading: boolean;
  previewState: PreviewState | null;
  setPreviewState: Dispatch<SetStateAction<PreviewState | null>>;
}

function AppManagementPreviewModal({
  loading,
  previewState,
  setPreviewState,
}: AppManagementPreviewModalProps) {
  return (
    <Modal
      destroyOnClose
      footer={null}
      open={Boolean(previewState)}
      title={previewState?.title}
      width={760}
      onCancel={() => setPreviewState(null)}
    >
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Spin />
        </div>
      ) : previewState ? (
        <div className="space-y-5">
          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
            {previewState.subtitle}
          </div>
          {renderSchemaOutline({ nodes: previewState.schema.components })}
        </div>
      ) : null}
    </Modal>
  );
}

export default AppManagementPreviewModal;
