import type { UploadType } from "@codigo/share";
import request from "@/shared/utils/request";

export async function uploadFile(formData: FormData) {
  return request("/resources/upload", {
    data: formData,
    method: "POST",
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export async function getResources(type: UploadType) {
  return request("/resources", {
    params: { type },
    method: "GET",
  });
}

// 资源删除的接口
export async function deleteResource(id: number) {
  return request("/resources", {
    params: { id },
    method: "DELETE",
  });
}
