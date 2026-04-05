import { Empty, Spin } from "antd";
import type {
  LocalDraftMeta,
  MyPagePayload,
} from "../../types/appManagement";
import AppCard from "../shared/AppCard";

interface DevelopingSectionProps {
  draftMeta: LocalDraftMeta | null;
  loading: boolean;
  myPageData?: MyPagePayload;
  onContinue: () => void;
}

function DevelopingSection({
  draftMeta,
  loading,
  myPageData,
  onContinue,
}: DevelopingSectionProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin />
      </div>
    );
  }

  if (myPageData?.page || draftMeta) {
    return (
      <AppCard
        actionText="继续开发"
        desc={
          draftMeta?.isUpdatedAfterPublish
            ? "当前存在未发布草稿，可继续进入编辑器完善页面内容。"
            : "当前草稿与最新发布版本一致，可继续进入编辑器迭代。"
        }
        meta={[
          draftMeta?.isUpdatedAfterPublish ? "草稿待发布" : "草稿已同步",
          `最近编辑 ${draftMeta?.updatedAt ?? "暂无"}`,
        ]}
        title={myPageData?.page?.page_name || "未命名应用"}
        onAction={onContinue}
      />
    );
  }

  return (
    <Empty
      description="暂无开发中的应用，选择模板后即可开始搭建"
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    />
  );
}

export default DevelopingSection;
