import { CaretLeftOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useRequest } from "ahooks";
import { Button, Drawer, Empty, FloatButton, QRCode, Result, Spin } from "antd";
import type { ComponentNode, IPageSchema } from "@codigo/schema";
import { useEffect, useMemo, useState } from "react";
import type { AxiosError } from "axios";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getPublishedPage } from "@/modules/editor/api/low-code";
import {
  generateComponent,
  resolveInitialPageState,
  type RuntimeAction,
} from "@/modules/editor/runtime";
import { useFitScale } from "@/shared/hooks";
import { AdminShell } from "@/modules/pageShell/components/AdminShell";

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
      pageGroups: payload.schema.pageGroups,
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
  layoutMode,
  grid,
  canvasHeight,
}: {
  nodes: ComponentNode[];
  onNavigatePage: (pagePath: string) => void;
  layoutMode?: "absolute" | "grid";
  grid?: { cols: number; rows: number; gap?: number } | null;
  canvasHeight?: number;
}) {
  const initialPageState = useMemo(() => resolveInitialPageState(nodes), [nodes]);
  const [pageState, setPageState] = useState(initialPageState);

  useEffect(() => {
    setPageState(initialPageState);
  }, [initialPageState]);

  const runtime = useMemo(
    () => ({
      mode: "preview" as const,
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

        if (action.type === "setActiveContainer") {
          if (!action.viewGroupId || !action.containerId) {
            return;
          }
          const viewGroupId = action.viewGroupId;
          const containerId = action.containerId;
          setPageState((prev) => {
            const nextMap = {
              ...((prev as any).__viewGroupActive ?? {}),
              [viewGroupId]: containerId,
            };
            return {
              ...prev,
              __viewGroupActive: nextMap,
            };
          });
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

        if (action.type === "scrollTo") {
          const targetElement = document.getElementById(action.targetId);
          targetElement?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
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

  const normalizedLayoutMode = layoutMode === "grid" ? "grid" : "absolute";
  const gridCols = Math.max(1, grid?.cols ?? 12);
  const gridRows = Math.max(1, grid?.rows ?? 12);
  const gridGap = Math.max(0, grid?.gap ?? 0);
  const minHeight = Math.max(700, canvasHeight ?? 0);

  return (
    <div
      className="relative"
      style={{
        minHeight: `${minHeight}px`,
        ...(normalizedLayoutMode === "grid"
          ? {
              display: "grid",
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${gridRows}, minmax(0, 1fr))`,
              gap: gridGap,
              alignContent: "start",
            }
          : null),
      }}
    >
      {(() => {
        const renderTreeNode = (
          node: ComponentNode,
          parent: ComponentNode | null,
          isRootNode: boolean,
        ) => {
          const renderedChildren =
            node.children?.map((child) => renderTreeNode(child, node, false)) ?? [];
          const isAbsoluteNode =
            node.styles?.left !== undefined && node.styles?.top !== undefined;
          const parentUseGrid =
            parent?.type === "viewGroup" &&
            Boolean(
              (parent.props as Record<string, unknown> | undefined)?.contentUseGrid,
            );
          const shouldUseGrid =
            normalizedLayoutMode === "grid" && (isRootNode || parentUseGrid);

          const wrapperStyle: Record<string, string | number | undefined> =
            shouldUseGrid
              ? {
                  gridColumn: `${Math.max(1, Number(node.styles?.gridColumnStart ?? 1))} / span ${Math.max(1, Number(node.styles?.gridColumnSpan ?? 1))}`,
                  gridRow: `${Math.max(1, Number(node.styles?.gridRowStart ?? 1))} / span ${Math.max(1, Number(node.styles?.gridRowSpan ?? 1))}`,
                  position: "relative",
                  width: "100%",
                  height: "100%",
                }
              : isAbsoluteNode
                ? {
                    left: node.styles?.left as string | number | undefined,
                    top: node.styles?.top as string | number | undefined,
                    position: "absolute",
                    width: node.styles?.width as string | number | undefined,
                    height: node.styles?.height as string | number | undefined,
                  }
                : {
                    position: "relative",
                    width: node.styles?.width as string | number | undefined,
                    height: node.styles?.height as string | number | undefined,
                  };

          return (
            <div
              key={node.id}
              className={!shouldUseGrid && isAbsoluteNode ? "absolute" : undefined}
              style={wrapperStyle}
            >
              <div className="relative">
                {generateComponent(node, undefined, renderedChildren, runtime)}
              </div>
            </div>
          );
        };

        return nodes.map((node) => renderTreeNode(node, null, true));
      })()}
    </div>
  );
}

export default function Release() {
  const nav = useNavigate();
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [infoOpen, setInfoOpen] = useState(false);
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
  const errorMessage =
    ((error as AxiosError<{ msg?: string }>)?.response?.data?.msg as string | undefined) ??
    "";
  const errorStatus = (error as AxiosError)?.response?.status ?? 0;
  const location = useLocation();
  const redirectTo = useMemo(
    () => `${location.pathname}${location.search}`,
    [location.pathname, location.search],
  );

  const schema = useMemo(() => resolveSchemaFromReleasePayload(data), [data]);
  const activePage = useMemo(
    () => resolveReleasePage(schema, requestedPagePath),
    [schema, requestedPagePath],
  );
  const activeNodes = activePage?.components ?? schema.components;
  const deviceType = data?.deviceType === "mobile" ? "mobile" : "pc";
  const canvasWidth =
    Number(data?.canvasWidth) || (deviceType === "pc" ? 1024 : 380);
  const canvasHeight =
    Number(data?.canvasHeight) || (deviceType === "pc" ? 768 : 700);
  const layoutMode = data?.layoutMode === "grid" ? "grid" : "absolute";
  const shellLayout = data?.shellLayout;
  const grid = data?.grid ?? null;
  const { containerRef, scale, scaledWidth, scaledHeight } = useFitScale({
    contentWidth: canvasWidth,
    contentHeight: canvasHeight,
    padding: deviceType === "mobile" ? 12 : 0,
    maxScale: 3,
  });

  const previewUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return "";
    }
    const base = window.location.href.split("#")[0];
    return `${base}#${location.pathname}${location.search}`;
  }, [location.pathname, location.search]);

  const shouldUseAdminShell = Array.isArray(schema.pages) && schema.pages.length > 0;
  const shouldStretchShellContent = shouldUseAdminShell && deviceType !== "mobile";
  const shouldShowInitialLoading = isValidPageId && loading && !data && !error;

  if (shouldShowInitialLoading) {
    return (
      <div className="h-screen bg-slate-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

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
          title={
            errorMessage.includes("过期")
              ? "发布链接已过期"
              : errorMessage.includes("登录")
                ? "当前内容需要登录"
                : errorMessage.includes("不可访问")
                  ? "当前内容无权访问"
                  : "发布页加载失败"
          }
          subTitle={
            <div className="space-y-3">
              <div>{errorMessage || "未能读取已发布内容，请确认页面已成功发布后重试"}</div>
              {errorStatus === 401 ? (
                <div>
                  <Button
                    type="primary"
                    onClick={() => {
                      nav(`/?modal=login&redirect=${encodeURIComponent(redirectTo)}`);
                    }}
                  >
                    去登录
                  </Button>
                </div>
              ) : null}
            </div>
          }
        />
      );
    }

    return (
      <ReleaseCanvas
        nodes={activeNodes}
        layoutMode={layoutMode}
        grid={grid}
        canvasHeight={canvasHeight}
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
      <div className="h-screen overflow-hidden bg-slate-50">
        <AdminShell
          pages={schema.pages!}
          pageGroups={schema.pageGroups ?? []}
          activePagePath={activePage?.path ?? null}
          onSelectPagePath={(pagePath) => {
            setSearchParams((prev) => {
              const nextParams = new URLSearchParams(prev);
              nextParams.set("page", pagePath);
              return nextParams;
            });
          }}
          title={data?.page_name || "管理后台"}
          layout={shellLayout}
        >
          {shouldStretchShellContent ? (
            <div className="h-full w-full overflow-auto bg-white text-left">
              <div
                className="min-h-full"
                style={{ minWidth: canvasWidth, minHeight: canvasHeight }}
              >
                {content}
              </div>
            </div>
          ) : (
            <div
              ref={containerRef}
              className={`h-full w-full flex items-center justify-center ${
                deviceType === "mobile" ? "p-3" : "p-0"
              }`}
            >
              <div className="relative" style={{ width: scaledWidth, height: scaledHeight }}>
                <div
                  className={`bg-white text-left overflow-y-auto overflow-x-hidden scrollbar-hide ${
                    deviceType === "mobile"
                      ? "rounded-[30px] border-[8px] border-slate-800 shadow-2xl"
                      : "rounded-none border-0 shadow-none"
                  }`}
                  style={{
                    width: canvasWidth,
                    height: canvasHeight,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
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
              </div>
            </div>
          )}
        </AdminShell>

        <FloatButton icon={<CaretLeftOutlined />} onClick={() => nav(-1)} />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-50">
      <div
        ref={containerRef}
        className={`h-full w-full flex items-center justify-center ${
          deviceType === "mobile" ? "p-3" : "p-0"
        }`}
      >
        {isValidPageId && !loading && !error && activeNodes.length > 0 ? (
          <div className="relative" style={{ width: scaledWidth, height: scaledHeight }}>
            <div
              className={`bg-white text-left overflow-y-auto overflow-x-hidden scrollbar-hide ${
                deviceType === "mobile"
                  ? "rounded-[30px] border-[8px] border-slate-800 shadow-2xl"
                  : "rounded-none border-0 shadow-none"
              }`}
              style={{
                width: canvasWidth,
                height: canvasHeight,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
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
          </div>
        ) : (
          <div className="w-full max-w-2xl">{content}</div>
        )}
      </div>

      <FloatButton
        icon={<InfoCircleOutlined />}
        onClick={() => setInfoOpen(true)}
        style={{ right: 24, bottom: 88 }}
      />
      <FloatButton icon={<CaretLeftOutlined />} onClick={() => nav(-1)} />

      <Drawer
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        title="发布信息"
        placement="right"
        width={380}
      >
        <div className="space-y-4">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="text-sm font-medium text-slate-900">扫码打开</div>
            <div className="mt-3 flex justify-center">
              <QRCode value={previewUrl || "about:blank"} />
            </div>
            <div className="mt-3 text-center text-sm text-slate-500">
              扫码后可在当前地址打开发布页
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            {deviceType === "mobile" ? "移动端" : "PC 端"} · 画布 {canvasWidth} ×{" "}
            {canvasHeight}
          </div>

          {data?.page_name ? (
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
              <div className="font-medium text-slate-900">{data.page_name}</div>
              <div className="mt-2 leading-6 text-slate-500">
                {data.desc || "当前页面已发布"}
              </div>
            </div>
          ) : null}
        </div>
      </Drawer>
    </div>
  );
}
