import type {
  PageWorkspaceExplorerResponse,
  PageWorkspaceFileResponse,
  PageWorkspaceIDEConfigResponse,
  PageWorkspaceResponse,
  PageWorkspaceRuntimeResponse,
  PageWorkspaceSessionResponse,
  PostReleaseRequest,
  PutPageWorkspaceFileRequest,
  PutPageWorkspaceFileResponse,
  getQuestionDataByIdRequest,
} from "@codigo/materials";
import request from "@/shared/utils/request";

export async function postRelease(data: PostReleaseRequest) {
  return request("/pages/me", {
    data,
    method: "PUT",
  });
}

export async function getLowCodePage() {
  return request("/pages/me", { method: "GET" });
}

export async function getQuestionComponents() {
  return request("/pages/me/analytics/components", { method: "GET" });
}

export async function getQuestionData() {
  return request("/pages/me/analytics/submissions", { method: "GET" });
}

export async function getQuestionDataByTypeRequest(
  data: getQuestionDataByIdRequest,
) {
  return request(`/pages/me/analytics/components/${data.id}/submissions`, {
    method: "GET",
  });
}

export async function getPageVersions(id: number) {
  return request(`/pages/${id}/versions`, { method: "GET" });
}

export async function getPageVersionDetail(id: number, versionId: string) {
  return request(`/pages/${id}/versions/${versionId}`, { method: "GET" });
}

export async function getPageWorkspace(id: number) {
  return request<{ data: PageWorkspaceResponse }>(`/pages/${id}/workspace`, {
    method: "GET",
  });
}

export async function syncPageWorkspace(id: number) {
  return request<{ data: PageWorkspaceResponse }>(`/pages/${id}/workspace`, {
    method: "POST",
  });
}

export async function getPageWorkspaceSession(id: number) {
  return request<{ data: PageWorkspaceSessionResponse }>(
    `/pages/${id}/workspace/session`,
    {
      method: "GET",
    },
  );
}

export async function startPageWorkspaceSession(id: number) {
  return request<{ data: PageWorkspaceSessionResponse }>(
    `/pages/${id}/workspace/session`,
    {
      method: "POST",
    },
  );
}

export async function getPageWorkspaceRuntime(id: number) {
  return request<{ data: PageWorkspaceRuntimeResponse }>(
    `/pages/${id}/workspace/runtime`,
    {
      method: "GET",
    },
  );
}

export async function startPageWorkspaceRuntime(id: number) {
  return request<{ data: PageWorkspaceRuntimeResponse }>(
    `/pages/${id}/workspace/runtime`,
    {
      method: "POST",
    },
  );
}

export async function stopPageWorkspaceRuntime(id: number) {
  return request<{ data: PageWorkspaceRuntimeResponse | null }>(
    `/pages/${id}/workspace/runtime`,
    {
      method: "DELETE",
    },
  );
}

export async function getPageWorkspaceIDEConfig(id: number) {
  return request<{ data: PageWorkspaceIDEConfigResponse }>(
    `/pages/${id}/workspace/ide-config`,
    {
      method: "GET",
    },
  );
}

export async function startPageWorkspaceIDEConfig(id: number) {
  return request<{ data: PageWorkspaceIDEConfigResponse }>(
    `/pages/${id}/workspace/ide-config`,
    {
      method: "POST",
    },
  );
}

export async function getPageWorkspaceExplorer(id: number) {
  return request<{ data: PageWorkspaceExplorerResponse }>(
    `/pages/${id}/workspace/explorer`,
    {
      method: "GET",
    },
  );
}

export async function getPageWorkspaceFile(id: number, path: string) {
  return request<{ data: PageWorkspaceFileResponse }>(
    `/pages/${id}/workspace/file`,
    {
      method: "GET",
      params: { path },
    },
  );
}

export async function savePageWorkspaceFile(
  id: number,
  data: PutPageWorkspaceFileRequest,
) {
  return request<{ data: PutPageWorkspaceFileResponse }>(
    `/pages/${id}/workspace/file`,
    {
      data,
      method: "PUT",
    },
  );
}
