import type {
  PostReleaseRequest,
  getQuestionDataByIdRequest,
} from "@codigo/share";
import request from "@/shared/utils/request";

export async function postRelease(data: PostReleaseRequest) {
  return request("/low_code/release", {
    data,
    method: "POST",
  });
}

export async function getLowCodePage() {
  return request("/low_code/release_with_user");
}

export async function getQuestionComponents() {
  return request("/low_code/question_components");
}

export async function getQuestionData() {
  return request("/low_code/question_data");
}

export async function getQuestionDataByTypeRequest(
  data: getQuestionDataByIdRequest,
) {
  return request("/low_code/get_question_data_by_id", { data, method: "POST" });
}
