import {
  resolveAdminPermissions,
  type AdminPermission,
  type IUser,
} from "@codigo/schema";
import { message } from "antd";
import { useCallback, useState } from "react";
import { updateAdminUserPermissions } from "@/modules/admin/api/admin";

export function useAdminPermissionEditor(onSaved: () => Promise<void>) {
  const [currentUser, setCurrentUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);

  const handleOpen = useCallback((user: IUser) => {
    setCurrentUser(user);
    setPermissions(
      resolveAdminPermissions(user.global_role, user.admin_permissions),
    );
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
    setCurrentUser(null);
    setPermissions([]);
  }, []);

  const handleChange = useCallback((value: AdminPermission[]) => {
    const nextPermissions = Array.from(new Set(value));
    if (
      nextPermissions.includes("PERMISSION_ASSIGN") &&
      !nextPermissions.includes("USER_MANAGE")
    ) {
      nextPermissions.unshift("USER_MANAGE");
    }
    setPermissions(nextPermissions);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!currentUser) {
      return;
    }

    setLoading(true);
    try {
      await updateAdminUserPermissions(currentUser.id, permissions);
      message.success("权限分配成功");
      handleClose();
      await onSaved();
    } catch (error: unknown) {
      const nextMessage =
        error instanceof Error ? error.message : "权限分配失败";
      message.error(nextMessage);
    } finally {
      setLoading(false);
    }
  }, [currentUser, handleClose, onSaved, permissions]);

  return {
    currentUser,
    handleChange,
    handleClose,
    handleConfirm,
    handleOpen,
    loading,
    open,
    permissions,
  };
}
