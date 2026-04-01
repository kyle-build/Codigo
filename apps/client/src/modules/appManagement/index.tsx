import { useMemo, useState } from "react";
import { useRequest } from "ahooks";
import { Avatar, Button, Empty, List, Modal, Spin, Tag, message } from "antd";
import {
  AppstoreOutlined,
  EditOutlined,
  EyeOutlined,
  HistoryOutlined,
  RocketOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { observer } from "mobx-react-lite";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { ComponentNode } from "@codigo/schema";
import {
  getLowCodePage,
  getPageVersionDetail,
  getPageVersions,
  getPublicPages,
  getPublishedPage,
} from "@/modules/editor/api/low-code";
import { useStoreAuth } from "@/shared/hooks";
import {
  buildTemplateSchema,
  templates,
  writeTemplateToDraft,
  type TemplatePreset,
} from "./TemplateSelect";
import { HomeFooter } from "@/modules/home/components/homeFooter/homeFooter";
import { HomeHeader } from "@/modules/home/components/homeHeader/homeHeader";
import { ParticleBackground } from "@/modules/home/components/background/ParticleBackground";

interface PublicPageItem {
  id: number;
  page_name: string;
  desc: string;
  owner_name: string;
  owner_head_img?: string | null;
  version_count: number;
  latest_version: number;
  latest_published_at?: string | null;
}

interface PageVersionItem {
  id: string;
  page_id: number;
  version: number;
  desc: string;
  created_at: string;
}

interface MyPagePayload {
  page: Record<string, any> | null;
  versions: PageVersionItem[];
}

interface PreviewState {
  title: string;
  subtitle: string;
  schema: {
    version: number;
    components: ComponentNode[];
  };
}

const componentLabelMap: Record<string, string> = {
  titleText: "文本组件",
  richText: "富文本组件",
  split: "分割组件",
  card: "卡片组件",
  list: "列表组件",
  image: "图片组件",
  input: "输入框组件",
  textArea: "文本域组件",
  radio: "单选框组件",
  checkbox: "多选框组件",
  button: "按钮组件",
  container: "容器组件",
  table: "表格组件",
  qrcode: "二维码组件",
  alert: "提示组件",
  empty: "空状态组件",
  chart: "图表组件",
  video: "视频组件",
  swiper: "轮播组件",
  statistic: "统计组件",
  twoColumn: "双栏组件",
};

function stripHtml(value: string) {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function summarizeProps(props?: Record<string, unknown>) {
  if (!props) {
    return "未配置内容";
  }

  const pieces: string[] = [];

  if (typeof props.title === "string" && props.title.trim()) {
    pieces.push(props.title.trim());
  }

  if (typeof props.description === "string" && props.description.trim()) {
    pieces.push(props.description.trim());
  }

  if (typeof props.text === "string" && props.text.trim()) {
    pieces.push(props.text.trim());
  }

  if (typeof props.placeholder === "string" && props.placeholder.trim()) {
    pieces.push(`占位：${props.placeholder.trim()}`);
  }

  if (typeof props.content === "string" && props.content.trim()) {
    const contentText = stripHtml(props.content);
    if (contentText) {
      pieces.push(contentText);
    }
  }

  if (Array.isArray(props.items) && props.items.length) {
    pieces.push(`列表项 ${props.items.length} 个`);
  }

  if (Array.isArray(props.options) && props.options.length) {
    pieces.push(`选项 ${props.options.length} 个`);
  }

  if (!pieces.length) {
    return "未配置内容";
  }

  return pieces.join(" · ").slice(0, 120);
}

function resolveSchemaFromReleasePayload(
  payload: Record<string, any> | null | undefined,
) {
  if (!payload) {
    return {
      version: 2,
      components: [] as ComponentNode[],
    };
  }

  if (payload.schema?.components?.length) {
    return {
      version: payload.schema.version ?? 2,
      components: payload.schema.components as ComponentNode[],
    };
  }

  const components = Array.isArray(payload.components)
    ? payload.components.map((component: Record<string, any>) => ({
        id: component.node_id ?? String(component.id),
        type: component.type,
        props: component.options ?? {},
        styles: component.styles,
        children: [],
      }))
    : [];

  return {
    version: payload.schema_version ?? 1,
    components,
  };
}

function SchemaOutline({
  nodes,
  depth = 0,
}: {
  nodes: ComponentNode[];
  depth?: number;
}) {
  if (!nodes.length) {
    return (
      <Empty
        description="暂无可展示内容"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div className="space-y-3">
      {nodes.map((node) => (
        <div
          key={node.id}
          className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
          style={{ marginLeft: depth * 16 }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <Tag color="green">
              {componentLabelMap[node.type] ?? node.type ?? "组件"}
            </Tag>
            <span className="text-sm font-medium text-slate-700">
              {summarizeProps(
                node.props as Record<string, unknown> | undefined,
              )}
            </span>
          </div>
          {!!node.children?.length && (
            <div className="mt-3">
              <SchemaOutline nodes={node.children} depth={depth + 1} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AppCard({
  title,
  desc,
  meta,
  actionText,
  onAction,
}: {
  title: string;
  desc: string;
  meta: string[];
  actionText: string;
  onAction: () => void;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="flex min-h-[156px] flex-col justify-between gap-5">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">{desc}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {meta.map((item) => (
              <span
                key={item}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500"
              >
                {item}
              </span>
            ))}
          </div>
          <Button type="primary" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      </div>
    </article>
  );
}

function AppMetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/72 p-4 shadow-[0_18px_42px_-36px_rgba(15,23,42,0.55)] backdrop-blur-xl">
      <div className="text-xs font-medium uppercase tracking-[0.22em] text-slate-400">
        {label}
      </div>
      <div className="mt-3 text-lg font-semibold text-slate-900">{value}</div>
    </div>
  );
}

const AppManagement = observer(() => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { store: storeAuth } = useStoreAuth();
  const isLoggedIn = Boolean(storeAuth.token);
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);

  const { data: publicPages = [], loading: publicLoading } = useRequest(
    async () => {
      const res = await getPublicPages();
      return (res.data ?? []) as PublicPageItem[];
    },
  );

  const { data: myPageData, loading: myPageLoading } = useRequest(
    async () => {
      const pageRes = await getLowCodePage();
      const page = pageRes.data;

      if (!page?.id) {
        return {
          page: null,
          versions: [],
        } as MyPagePayload;
      }

      const versionRes = await getPageVersions(page.id);

      return {
        page,
        versions: (versionRes.data ?? []) as PageVersionItem[],
      } as MyPagePayload;
    },
    {
      ready: isLoggedIn,
      refreshDeps: [isLoggedIn, storeAuth.details?.id],
    },
  );

  const { runAsync: openPreview, loading: previewLoading } = useRequest(
    async (task: () => Promise<PreviewState>) => {
      const nextState = await task();
      setPreviewState(nextState);
    },
    {
      manual: true,
    },
  );

  const localDraftMeta = useMemo(() => {
    if (!isLoggedIn || typeof window === "undefined") {
      return null;
    }

    const schema = window.localStorage.getItem("pageSchema");
    const storeTime = Number(window.localStorage.getItem("store_time") ?? 0);
    const releaseTime = Number(
      window.localStorage.getItem("release_time") ?? 0,
    );
    const hasDraft = Boolean(schema);
    const isUpdatedAfterPublish = hasDraft && storeTime >= releaseTime;

    if (!hasDraft && !myPageData?.page) {
      return null;
    }

    return {
      hasDraft,
      isUpdatedAfterPublish,
      updatedAt: storeTime
        ? dayjs(storeTime).format("YYYY-MM-DD HH:mm")
        : "暂无",
    };
  }, [isLoggedIn, myPageData?.page]);

  const availableTabs = isLoggedIn
    ? ["developing", "published", "versions", "templates"]
    : ["published", "templates"];
  const currentTab = availableTabs.includes(searchParams.get("tab") ?? "")
    ? (searchParams.get("tab") as string)
    : availableTabs[0];

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  const handleOpenTemplatePreview = (template: TemplatePreset) => {
    setPreviewState({
      title: template.name,
      subtitle: `${template.deviceType === "mobile" ? "移动端" : "PC 端"} · 画布 ${template.canvasWidth} × ${template.canvasHeight}`,
      schema: buildTemplateSchema(template),
    });
  };

  const handleUseTemplate = (template: TemplatePreset) => {
    if (!isLoggedIn) {
      message.info("访客仅可查看模板内容，登录后可将模板载入编辑器");
      return;
    }

    writeTemplateToDraft(template);
    navigate("/editor");
  };

  const handleOpenPublishedPage = async (
    pageId: number,
    title: string,
    subtitle: string,
  ) => {
    await openPreview(async () => {
      const res = await getPublishedPage(pageId);
      return {
        title,
        subtitle,
        schema: resolveSchemaFromReleasePayload(res.data),
      };
    });
  };

  const handleOpenVersion = async (
    pageId: number,
    version: PageVersionItem,
  ) => {
    await openPreview(async () => {
      const res = await getPageVersionDetail(pageId, version.id);
      return {
        title: `历史版本 v${version.version}`,
        subtitle: dayjs(version.created_at).format("YYYY-MM-DD HH:mm"),
        schema: resolveSchemaFromReleasePayload(res.data?.schema_data),
      };
    });
  };

  const developingContent = myPageLoading ? (
    <div className="flex items-center justify-center py-20">
      <Spin />
    </div>
  ) : myPageData?.page || localDraftMeta ? (
    <AppCard
      title={myPageData?.page?.page_name || "未命名应用"}
      desc={
        localDraftMeta?.isUpdatedAfterPublish
          ? "当前存在未发布草稿，可继续进入编辑器完善页面内容。"
          : "当前草稿与最新发布版本一致，可继续进入编辑器迭代。"
      }
      meta={[
        localDraftMeta?.isUpdatedAfterPublish ? "草稿待发布" : "草稿已同步",
        `最近编辑 ${localDraftMeta?.updatedAt ?? "暂无"}`,
      ]}
      actionText="继续开发"
      onAction={() =>
        navigate(
          myPageData?.page?.id ? `/editor?id=${myPageData.page.id}` : "/editor",
        )
      }
    />
  ) : (
    <Empty
      description="暂无开发中的应用，选择模板后即可开始搭建"
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    />
  );

  const publishedContent = isLoggedIn ? (
    myPageLoading ? (
      <div className="flex items-center justify-center py-20">
        <Spin />
      </div>
    ) : myPageData?.page ? (
      <AppCard
        title={myPageData.page.page_name || "未命名应用"}
        desc={myPageData.page.desc || "当前版本已发布，可向访客公开展示。"}
        meta={[
          `历史版本 ${myPageData.versions.length} 个`,
          myPageData.versions[0]
            ? `最近发布 ${dayjs(myPageData.versions[0].created_at).format("YYYY-MM-DD HH:mm")}`
            : "已发布",
        ]}
        actionText="查看已发布内容"
        onAction={() => {
          const currentPage = myPageData.page;
          if (!currentPage) {
            return;
          }

          handleOpenPublishedPage(
            currentPage.id,
            currentPage.page_name || "已发布应用",
            currentPage.desc || "当前对外展示的发布内容",
          );
        }}
      />
    ) : (
      <Empty
        description="你还没有已发布的应用"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    )
  ) : publicLoading ? (
    <div className="flex items-center justify-center py-20">
      <Spin />
    </div>
  ) : publicPages.length ? (
    <div className="grid gap-5 md:grid-cols-2">
      {publicPages.map((page) => (
        <article
          key={page.id}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h3 className="truncate text-lg font-semibold text-slate-900">
                {page.page_name}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {page.desc || "该页面已完成发布，可供访客查看页面内容。"}
              </p>
            </div>
            <Avatar
              src={page.owner_head_img || undefined}
              icon={!page.owner_head_img && <UserOutlined />}
              className={!page.owner_head_img ? "bg-emerald-500" : ""}
            />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
              开发者 {page.owner_name}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
              版本 {page.version_count} 个
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
              最新 v{page.latest_version}
            </span>
          </div>
          <div className="mt-6 flex justify-end">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() =>
                handleOpenPublishedPage(
                  page.id,
                  page.page_name,
                  page.latest_published_at
                    ? `最近发布 ${dayjs(page.latest_published_at).format("YYYY-MM-DD HH:mm")}`
                    : `开发者 ${page.owner_name}`,
                )
              }
            >
              查看内容
            </Button>
          </div>
        </article>
      ))}
    </div>
  ) : (
    <Empty
      description="暂无可浏览的已发布页面"
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    />
  );

  const versionContent = myPageLoading ? (
    <div className="flex items-center justify-center py-20">
      <Spin />
    </div>
  ) : myPageData?.versions.length ? (
    <List
      dataSource={myPageData.versions}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Button
              key={item.id}
              type="link"
              onClick={() => handleOpenVersion(item.page_id, item)}
            >
              查看版本内容
            </Button>,
          ]}
        >
          <List.Item.Meta
            avatar={
              <Avatar
                icon={<HistoryOutlined />}
                className="bg-emerald-500/90"
              />
            }
            title={`版本 v${item.version}`}
            description={`${item.desc || "历史发布版本"} · ${dayjs(item.created_at).format("YYYY-MM-DD HH:mm")}`}
          />
        </List.Item>
      )}
    />
  ) : (
    <Empty
      description="暂无历史版本记录"
      image={Empty.PRESENTED_IMAGE_SIMPLE}
    />
  );

  const templateContent = (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => (
        <article
          key={template.key}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
        >
          <div className="mb-3 flex flex-wrap gap-2">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700"
              >
                {tag}
              </span>
            ))}
          </div>
          <h3 className="text-lg font-semibold text-slate-900">
            {template.name}
          </h3>
          <p className="mt-3 min-h-[72px] text-sm leading-6 text-slate-500">
            {template.desc}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
              画布 {template.canvasWidth} × {template.canvasHeight}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
              {template.components.length} 个组件
            </span>
          </div>
          <div className="mt-6 flex gap-3">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleOpenTemplatePreview(template)}
            >
              查看模板
            </Button>
            {isLoggedIn && (
              <Button
                type="primary"
                icon={<RocketOutlined />}
                onClick={() => handleUseTemplate(template)}
              >
                使用模板
              </Button>
            )}
          </div>
        </article>
      ))}
    </div>
  );

  const navigationItems = useMemo(
    () =>
      isLoggedIn
        ? [
            {
              key: "developing",
              label: "开发中",
              title: "开发中应用",
              description: "继续处理草稿、进入编辑器并保持与当前工作区同步。",
              icon: <EditOutlined />,
              children: developingContent,
            },
            {
              key: "published",
              label: "已发布",
              title: "已发布应用",
              description: "查看对外可见的页面内容，快速核对线上展示状态。",
              icon: <EyeOutlined />,
              children: publishedContent,
            },
            {
              key: "versions",
              label: "版本历史",
              title: "历史版本",
              description: "回溯已发布记录，按版本查看每次发布的页面结构。",
              icon: <HistoryOutlined />,
              children: versionContent,
            },
            {
              key: "templates",
              label: "模板库",
              title: "模板库",
              description: "浏览内置模板，预览页面结构并快速载入到编辑器。",
              icon: <AppstoreOutlined />,
              children: templateContent,
            },
          ]
        : [
            {
              key: "published",
              label: "已发布",
              title: "已发布页面",
              description: "浏览公开页面内容，了解当前系统已上线的页面结构。",
              icon: <EyeOutlined />,
              children: publishedContent,
            },
            {
              key: "templates",
              label: "模板库",
              title: "模板库",
              description:
                "查看系统模板设计与组件结构，登录后可直接使用模板开发。",
              icon: <AppstoreOutlined />,
              children: templateContent,
            },
          ],
    [
      developingContent,
      isLoggedIn,
      publishedContent,
      templateContent,
      versionContent,
    ],
  );
  const currentItem =
    navigationItems.find((item) => item.key === currentTab) ??
    navigationItems[0];
  const overviewMetrics = isLoggedIn
    ? [
        {
          label: "草稿状态",
          value: localDraftMeta?.isUpdatedAfterPublish
            ? "待发布更新"
            : "已同步",
        },
        {
          label: "历史版本",
          value: `${myPageData?.versions.length ?? 0} 个`,
        },
        {
          label: "模板数量",
          value: `${templates.length} 套`,
        },
      ]
    : [
        {
          label: "公开页面",
          value: publicLoading ? "加载中" : `${publicPages.length} 个`,
        },
        {
          label: "模板数量",
          value: `${templates.length} 套`,
        },
        {
          label: "当前身份",
          value: "访客浏览",
        },
      ];

  return (
    <>
      <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC] text-slate-900 font-sans">
        <HomeHeader />
        <ParticleBackground />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(circle_at_top,black_32%,transparent_78%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.08),transparent_42%)]" />
        <main className="relative z-10 pt-24">
          <section className="mx-auto flex w-full max-w-7xl gap-6 px-6 pb-20 pt-8">
            <aside className="hidden w-[104px] shrink-0 lg:flex">
              <div className="flex h-full w-full flex-col items-center rounded-[30px] border border-slate-200/80 bg-white/82 px-3 py-5 shadow-[12px_0_40px_-36px_rgba(15,23,42,0.45)] backdrop-blur-xl">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-xl text-emerald-600 shadow-[0_20px_40px_-28px_rgba(16,185,129,0.75)]">
                  <RocketOutlined />
                </div>
                <div className="flex w-full flex-1 flex-col gap-3">
                  {navigationItems.map((item) => {
                    const active = currentTab === item.key;

                    return (
                      <button
                        key={item.key}
                        onClick={() => handleTabChange(item.key)}
                        className={`group relative flex w-full flex-col items-center justify-center gap-1 rounded-2xl px-2 py-3 transition-all duration-200 ${
                          active
                            ? "bg-emerald-500/10 text-emerald-600 shadow-[0_18px_32px_-24px_rgba(16,185,129,0.65)] before:absolute before:left-0 before:top-1/4 before:h-1/2 before:w-1 before:rounded-r-full before:bg-emerald-500"
                            : "bg-transparent text-slate-400 hover:bg-slate-100/80 hover:text-slate-600"
                        }`}
                      >
                        <span className="text-[18px] leading-none">
                          {item.icon}
                        </span>
                        <span className="text-[11px] font-medium">
                          {item.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            <section className="min-w-0 flex-1">
              <section
                id="app-management"
                className="overflow-hidden rounded-[32px] border border-slate-200/80 bg-white/80 shadow-[0_24px_80px_-48px_rgba(15,23,42,0.45)] backdrop-blur-xl"
              >
                <div className="border-b border-slate-200/80 px-6 py-6 md:px-8 md:py-8">
                  <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                    <div>
                      <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                        应用管理页面
                      </span>
                      <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                        集中查看模板、应用状态与版本历史
                      </h1>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
                        {isLoggedIn
                          ? "登录后可在此继续开发、查看已发布内容并回溯历史版本。"
                          : "访客可在此浏览已发布页面与模板内容，登录后即可进入编辑器继续开发。"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                      {isLoggedIn ? "当前身份：开发者" : "当前身份：访客"}
                    </div>
                  </div>

                  <div className="mt-8 grid gap-4 md:grid-cols-3">
                    {overviewMetrics.map((item) => (
                      <AppMetricCard
                        key={item.label}
                        label={item.label}
                        value={item.value}
                      />
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3 lg:hidden">
                    {navigationItems.map((item) => {
                      const active = currentTab === item.key;

                      return (
                        <button
                          key={item.key}
                          onClick={() => handleTabChange(item.key)}
                          className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all ${
                            active
                              ? "bg-emerald-500/10 text-emerald-600 shadow-[0_18px_32px_-24px_rgba(16,185,129,0.65)]"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200/80"
                          }`}
                        >
                          <span className="text-base leading-none">
                            {item.icon}
                          </span>
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="p-4 md:p-8">
                  <div className="mx-auto flex min-h-[520px] w-full max-w-5xl flex-col rounded-[28px] border border-slate-200/80 bg-white/92 p-5 shadow-[0_30px_80px_-52px_rgba(15,23,42,0.55)] backdrop-blur-xl md:p-6">
                    <div className="border-b border-slate-200/80 pb-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                        {currentItem.label}
                      </span>
                      <h2 className="mt-4 text-2xl font-semibold text-slate-900">
                        {currentItem.title}
                      </h2>
                      <p className="mt-3 text-sm leading-7 text-slate-500">
                        {currentItem.description}
                      </p>
                    </div>

                    <div className="mt-6 flex-1">{currentItem.children}</div>
                  </div>
                </div>
              </section>
            </section>
          </section>
        </main>
        <HomeFooter />
      </div>

      <Modal
        open={Boolean(previewState)}
        title={previewState?.title}
        footer={null}
        width={760}
        onCancel={() => setPreviewState(null)}
        destroyOnClose
      >
        {previewLoading ? (
          <div className="flex items-center justify-center py-24">
            <Spin />
          </div>
        ) : previewState ? (
          <div className="space-y-5">
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              {previewState.subtitle}
            </div>
            <SchemaOutline nodes={previewState.schema.components} />
          </div>
        ) : null}
      </Modal>
    </>
  );
});

export default AppManagement;
