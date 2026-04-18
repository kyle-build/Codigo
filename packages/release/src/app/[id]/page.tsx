import ComponentRender from "../../components/ComponentRender";
import type { GetReleaseDataResponse } from "@codigo/schema";

async function getData(id: string) {
  // 请求后端接口获取发布页面组件
  const response = await fetch(`${process.env.SERVER_URL!}/api/pages/${id}`, {
    cache: "no-cache",
  });

  if (!response.ok) throw new Error("未找到");

  const toJson = (await response.json()) as {
    code: number;
    data?: GetReleaseDataResponse;
  };

  if (!toJson.data) throw new Error("404");

  return toJson.data!;
}

interface PageType {
  params: { id: string };
  searchParams?: { page?: string };
}
export default async function Page({ params, searchParams }: PageType) {
  const data = await getData(params.id);

  return (
    <div className="h-screen w-screen overflow-hidden">
      <ComponentRender
        data={data}
        id={params.id}
        initialPagePath={searchParams?.page ?? null}
      />
    </div>
  );
}
