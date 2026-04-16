import type {
  GetTemplateListResponse,
  TemplateDetailResponse,
  TemplateListQuery,
  UpsertTemplateRequest,
} from "@codigo/schema";
import request from "@/shared/utils/request";

export async function fetchTemplateList(params?: TemplateListQuery) {
  const response = await request<{ data: GetTemplateListResponse }>("/templates", {
    method: "GET",
    params,
  });
  return response.data;
}

export async function fetchTemplateDetail(id: number) {
  const response = await request<{ data: TemplateDetailResponse }>(`/templates/${id}`, {
    method: "GET",
  });
  return response.data;
}

/**
 * 创建模板并返回最新模板详情。
 */
export async function createTemplate(data: UpsertTemplateRequest) {
  const response = await request<{ data: TemplateDetailResponse }>("/templates", {
    data,
    method: "POST",
  });
  return response.data;
}
