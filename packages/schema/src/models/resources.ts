/**
 * 定义资源上传后支持的文件类型。
 */
export type UploadType = "image" | "video";

/**
 * 描述资源中心中文件资源的基础信息。
 */
export interface IResources {
  id: number;
  account_id: number;
  url: string;
  type: UploadType;
  name: string;
}
