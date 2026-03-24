import { SetMetadata } from '@nestjs/common';
import type { GlobalRole } from '@codigo/schema';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: GlobalRole[]) => SetMetadata(ROLES_KEY, roles);
