// 资源类型映射
export type UploadType = "image" | "video";

export interface IResources {
  id: number;
  account_id: number;
  url: string;
  type: UploadType;
  name: string;
}
