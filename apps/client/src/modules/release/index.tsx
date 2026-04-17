import { CaretLeftOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import { Empty, FloatButton, QRCode, Result, Spin } from "antd";
import type { ComponentNode, IPageSchema } from "@codigo/schema";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getPublishedPage } from "@/modules/editor/api/low-code";
import {
  generateComponent,
  resolveInitialPageState,
  type RuntimeAction,
} from "@/modules/editor/runtime";
import { AdminShell } from "./components/AdminShell";

function resolveSchemaFromReleasePayload(
  payload: Record<string, any> | null | undefined,
): IPageSchema {
  if (!payload) {
    return {
      version: 3,
      components: [] as ComponentNode[],
    };
  }

  if (payload.schema) {
    return {
      version: payload.schema.version ?? 3,
      components: payload.schema.components as ComponentNode[],
      pages: payload.schema.pages,
      activePageId: payload.schema.activePageId,
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

function resolveReleasePage(schema: IPageSchema, requestedPath: string | null) {
  if (Array.isArray(schema.pages) && schema.pages.length) {
    return (
      schema.pages.find((page) => page.path === requestedPath) ??
      schema.pages.find((page) => page.id === schema.activePageId) ??
      schema.pages.find((page) => page.path === "home") ??
      schema.pages[0]
    );
  }

  return null;
}

function ReleaseCanvas({
  nodes,
  onNavigatePage,
}: {
  nodes: ComponentNode[];
  onNavigatePage: (pagePath: string) => void;
}) {
  const initialPageState = useMemo(() => resolveInitialPageState(nodes), [nodes]);
  const [pageState, setPageState] = useState(initialPageState);

  useEffect(() => {
    setPageState(initialPageState);
  }, [initialPageState]);

  const runtime = useMemo(
    () => ({
      pageState,
      onAction: (action: RuntimeAction) => {
        if (action.type === "set-state") {
          setPageState((prev) => ({
            ...prev,
            [action.key]: action.value,
          }));
          return;
        }

        if (action.type === "setState") {
          setPageState((prev) => ({
            ...prev,
            [action.key]: action.value,
          }));
          return;
        }

        if (action.type === "navigate") {
          if (action.path.startsWith("page:")) {
            onNavigatePage(action.path.slice(5));
            return;
          }
          window.location.assign(action.path);
          return;
        }

        if (action.type === "openUrl") {
          window.open(
            action.url,
            action.target ?? "_blank",
            "noopener,noreferrer",
          );
          return;
        }

        const targetElement = document.getElementById(action.targetId);
        targetElement?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    }),
    [onNavigatePage, pageState],
  );

  if (!nodes.length) {
    return (
      <Empty
        description="当前发布页暂无可展示内容"
        image={Empty.PRESENTED_IMAGE_SIMPLE}
      />
    );
  }

  return (
    <div
      className="relative"
      style={{
        minHeight: `${Math.max(700, nodes.length * 220)}px`,
      }}
    >
      {nodes.map(function renderTreeNode(node: ComponentNode) {
        const renderedChildren =
          node.children?.map((child) => renderTreeNode(child)) ?? [];

        return (
          <div
            key={node.id}
            className="absolute"
            style={{
              left: node.styles?.left as string | number | undefined,
              top: node.styles?.top as string | number | undefined,
            }}
          >
            <div className="relative">
              {generateComponent(node, undefined, renderedChildren, runtime)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Release() {
  const nav = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageIdRaw = params.id ?? searchParams.get("id") ?? "";
  const pageId = Number(pageIdRaw);
  const isValidPageId = Number.isFinite(pageId) && pageId > 0;
  const requestedPagePath = searchParams.get("page");

  const { data, loading, error } = useRequest(
    async () => {
      const res = await getPublishedPage(pageId);
      return res.data;
    },
    {
      ready: isValidPageId,
    },
  );

  const schema = useMemo(() => resolveSchemaFromReleasePayload(data), [data]);
  const activePage = useMemo(
    () => resolveReleasePage(schema, requestedPagePath),
    [schema, requestedPagePath],
  );
  const activeNodes = activePage?.components ?? schema.components;
  const deviceType = data?.deviceType === "pc" ? "pc" : "mobile";
  const canvasWidth =
    Number(data?.canvasWidth) || (deviceType === "pc" ? 1024 : 380);
  const canvasHeight =
    Number(data?.canvasHeight) || (deviceType === "pc" ? 768 : 700);

  const previewUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    return window.location.href;
  }, [isValidPageId]);

  const shouldUseAdminShell = Array.isArray(schema.pages) && schema.pages.length > 0;

  const content = (() => {
    if (!isValidPageId) {
      return (
        <Result
          status="warning"
          title="缺少页面编号"
          subTitle="当前链接没有携带可预览的发布页 id"
        />
      );
    }

    if (loading) {
      return (
        <div className="flex h-full items-center justify-center">
          <Spin size="large" />
        </div>
      );
    }

    if (error) {
      return (
        <Result
          status="error"
          title="发布页加载失败"
          subTitle="未能读取已发布内容，请确认页面已成功发布后重试"
        />
      );
    }

    return (
      <ReleaseCanvas
        nodes={activeNodes}
        onNavigatePage={(pagePath) => {
          setSearchParams((prev) => {
            const nextParams = new URLSearchParams(prev);
            nextParams.set("page", pagePath);
            return nextParams;
          });
        }}
      />
    );
  })();

  if (shouldUseAdminShell && pageId && !loading && !error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AdminShell
          pages={schema.pages!}
          activePagePath={activePage?.path ?? null}
          onSelectPagePath={(pagePath) => {
            setSearchParams((prev) => {
              const nextParams = new URLSearchParams(prev);
              nextParams.set("page", pagePath);
              return nextParams;
            });
          }}
          title={data?.page_name || "管理后台"}
        >
          <div className="p-6">
            <div
              className="bg-white text-left overflow-y-auto overflow-x-hidden shadow-2xl rounded-2xl border border-slate-200"
              style={{
                width: canvasWidth,
                height: canvasHeight,
                maxWidth: "100%",
              }}
            >
              {content}
            </div>
          </div>
        </AdminShell>

        <FloatButton icon={<CaretLeftOutlined />} onClick={() => nav(-1)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
        <section className="order-2 w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:order-1">
          <h1 className="text-xl font-semibold text-slate-900">发布预览</h1>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            发布后会直接读取服务端保存的页面数据，因此这里展示的是线上可访问的内容，而不是本地草稿。
          </p>
          <div className="mt-6 flex justify-center rounded-3xl bg-slate-50 p-5">
            <QRCode value={previewUrl || "about:blank"} />
          </div>
          <p className="mt-4 text-center text-sm text-slate-500">
            扫码后可在当前地址打开发布页
          </p>
          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {deviceType === "mobile" ? "移动端" : "PC 端"} · 画布 {canvasWidth}{" "}
            × {canvasHeight}
          </div>
          {data?.page_name ? (
            <div className="mt-6 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="font-medium text-slate-900">{data.page_name}</div>
              <div className="mt-2 leading-6 text-slate-500">
                {data.desc || "当前页面已发布"}
              </div>
            </div>
          ) : null}
        </section>

        <section className="order-1 flex w-full justify-center lg:order-2 lg:flex-1">
          <div
            className={`overflow-y-auto overflow-x-hidden bg-white text-left shadow-2xl ${
              deviceType === "mobile"
                ? "rounded-[30px] border-[8px] border-slate-800"
                : "rounded-2xl border border-slate-200"
            }`}
            style={{
              width: canvasWidth,
              height: canvasHeight,
              maxWidth: "100%",
            }}
          >
            {deviceType === "mobile" && (
              <div className="sticky top-0 z-50 flex h-6 items-center justify-between bg-black/90 px-4 font-mono text-[10px] text-white">
                <span>9:41</span>
                <div className="flex gap-1">
                  <div className="h-3 w-3 rounded-full bg-white/20" />
                  <div className="h-3 w-3 rounded-full bg-white/20" />
                </div>
              </div>
            )}
            {content}
          </div>
        </section>

        <div className="hidden w-full max-w-sm lg:order-3 lg:block" />
      </div>

      <FloatButton icon={<CaretLeftOutlined />} onClick={() => nav(-1)} />
    </div>
  );
}
