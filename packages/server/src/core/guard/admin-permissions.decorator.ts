import { SetMetadata } from '@nestjs/common';
import type { AdminPermission } from '@codigo/schema';

export const ADMIN_PERMISSIONS_KEY = 'admin_permissions';

export const AdminPermissions = (...permissions: AdminPermission[]) =>
  SetMetadata(ADMIN_PERMISSIONS_KEY, permissions);
