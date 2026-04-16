import { EyeOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Empty, Spin } from "antd";
import dayjs from "dayjs";
import type { MyPagePayload, PublicPageItem } from "../../types/appManagement";
import AppCard from "../shared/AppCard";

interface PublishedSectionProps {
  isLoggedIn: boolean;
  loading: boolean;
  myPageData?: MyPagePayload;
  publicLoading: boolean;
  publicPages: PublicPageItem[];
  onPreview: (
    pageId: number,
    title: string,
    subtitle: string,
  ) => void | Promise<void>;
}

function PublishedSection({
  isLoggedIn,
  loading,
  myPageData,
  onPreview,
  publicLoading,
  publicPages,
}: PublishedSectionProps) {
  if (isLoggedIn) {
    if (loading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Spin />
        </div>
      );
    }

    if (myPageData?.page) {
      const page = myPageData.page;

      return (
        <AppCard
          actionText="查看已发布内容"
          desc={page.desc || "当前版本已发布，可向访客公开展示。"}
          meta={[
            `历史版本 ${myPageData.versions.length} 个`,
            myPageData.versions[0]
              ? `最近发布 ${dayjs(myPageData.versions[0].created_at).format("YYYY-MM-DD HH:mm")}`
              : "已发布",
          ]}
          title={page.page_name || "未命名应用"}
          onAction={() =>
            onPreview(
              page.id,
              page.page_name || "已发布应用",
              page.desc || "当前对外展示的发布内容",
            )
          }
        />
      );
    }

    return (
      <Empty
        description="你还没有已发布的应用"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  if (publicLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin />
      </div>
    );
  }

  if (!publicPages.length) {
    return (
      <Empty
        description="暂无可浏览的已发布页面"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {publicPages.map((page) => (
        <article
          key={page.id}
          className="rounded-lg border border-slate-200/80 bg-white p-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-slate-900">
                {page.page_name}
              </h3>
              <p className="mt-1 text-xs leading-4 text-slate-500">
                {page.desc || "该页面已完成发布，可供访客查看页面内容。"}
              </p>
            </div>
            <Avatar
              className="mt-0.5 flex-shrink-0"
              icon={!page.owner_head_img && <UserOutlined />}
              size="small"
              src={page.owner_head_img || undefined}
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
              {page.owner_name}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-500">
              v{page.latest_version}
            </span>
          </div>
          <div className="mt-2 flex justify-end">
            <Button
              icon={<EyeOutlined />}
              size="small"
              type="primary"
              onClick={() =>
                onPreview(
                  page.id,
                  page.page_name,
                  page.latest_published_at
                    ? `发布于 ${dayjs(page.latest_published_at).format("YYYY-MM-DD")}`
                    : `开发者 ${page.owner_name}`,
                )
              }
            >
              查看
            </Button>
          </div>
        </article>
      ))}
    </div>
  );
}

export default PublishedSection;
