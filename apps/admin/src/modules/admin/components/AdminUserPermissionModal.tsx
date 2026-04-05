import {
  ADMIN_PERMISSION_DESCRIPTIONS,
  ADMIN_PERMISSION_LABELS,
  type AdminPermission,
} from "@codigo/schema";
import { Checkbox, Modal, Typography } from "antd";
import type { AdminPermissionModalProps } from "@/modules/admin/types/admin";

const { Text } = Typography;

export function AdminUserPermissionModal({
  currentUser,
  loading,
  onCancel,
  onChange,
  onConfirm,
  open,
  permissions,
}: AdminPermissionModalProps) {
  return (
    <Modal
      title={`为 ${currentUser?.username || ""} 分配后台权限`}
      open={open}
      confirmLoading={loading}
      onOk={() => void onConfirm()}
      onCancel={onCancel}
    >
      <Checkbox.Group
        className="flex flex-col gap-3"
        value={permissions}
        onChange={(value) => onChange(value as AdminPermission[])}
        options={Object.entries(ADMIN_PERMISSION_LABELS).map(([key, label]) => ({
          value: key,
          label: (
            <div className="flex flex-col">
              <span>{label}</span>
              <Text type="secondary">
                {ADMIN_PERMISSION_DESCRIPTIONS[key as AdminPermission]}
              </Text>
            </div>
          ),
        }))}
      />
    </Modal>
  );
}
