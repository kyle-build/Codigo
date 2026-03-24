export type GlobalRole = "SUPER_ADMIN" | "ADMIN" | "USER";

export interface IUser {
  id: number;
  phone: string;
  open_id: string;
  head_img: string;
  username: string;
  password: string;
  global_role: GlobalRole;
  status: "active" | "frozen";
}
