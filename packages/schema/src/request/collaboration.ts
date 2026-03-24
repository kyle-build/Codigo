import { PermissionRole } from "../collaboration";

export interface InviteCollaboratorRequest {
  userName: string;
  role: PermissionRole;
}

export interface UpdateCollaboratorRoleRequest {
  role: PermissionRole;
}
