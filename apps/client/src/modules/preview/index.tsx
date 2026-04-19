import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { FloatButton, message } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CaretLeftOutlined } from "@ant-design/icons";
import {
  generateComponent,
  resolveInitialPageState,
  type RuntimeAction,
} from "@/modules/editor/runtime";
import { useFitScale, useStorePage } from "@/shared/hooks";
import { useEditorComponents } from "@/modules/editor/hooks";
import type { ComponentNode, IEditorPageSchema, RuntimeStateValue } from "@codigo/schema";
import { AdminShell } from "@/modules/pageShell/components/AdminShell";

function resolvePreviewPage(
  pages: IEditorPageSchema[],
  requestedPath: string | null,
) {
  if (!pages.length) {
    return null;
  }

  return (
    pages.find((page) => page.path === requestedPath) ??
    pages.find((page) => page.path === "home") ??
    pages[0]
  );
}

const PreviewCanvas = observer(() => {
  const { getPages, loadPageData } = useEditorComponents();
  const { store } = useStorePage();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasInitializedRef = useRef(false);
  const pages = getPages.get();
  const requestedPagePath = searchParams.get("page");
  const activePage = useMemo(
    () => resolvePreviewPage(pages, requestedPagePath),
    [pages, requestedPagePath],
  );
  const componentTree = activePage?.components ?? [];
  const initialPageState = useMemo(
    () => resolveInitialPageState(componentTree),
    [componentTree],
  );
  const [pageState, setPageState] = useState<Record<string, RuntimeStateValue>>(
    () => initialPageState,
  );
  const pageStateRef = useRef(pageState);
  const lastPageSignatureRef = useRef<string>("");

  useEffect(() => {
    pageStateRef.current = pageState;
  }, [pageState]);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;
    void loadPageData(undefined, { silent: true });
  }, [loadPageData]);

  useEffect(() => {
    const stack = [...componentTree];
    const ids: string[] = [];
    while (stack.length) {
      const node = stack.pop();
      if (!node) {
        continue;
      }
      ids.push(node.id);
      const children = Array.isArray(node.children) ? node.children : [];
      for (let i = 0; i < children.length; i += 1) {
        stack.push(children[i]);
      }
    }

    const nextSignature = `${activePage?.id ?? ""}|${activePage?.path ?? ""}|${ids.join(",")}`;
    if (nextSignature === lastPageSignatureRef.current) {
      return;
    }

    lastPageSignatureRef.current = nextSignature;
    setPageState(initialPageState);
  }, [activePage?.id, activePage?.path, componentTree, initialPageState]);

  const runtime = useMemo(() => {
    const getByPath = (input: unknown, path: string) => {
      if (!path) {
        return input;
      }

      const parts = path.split(".").filter(Boolean);
      let cur: any = input;
      for (const key of parts) {
        if (cur == null) {
          return undefined;
        }
        cur = cur[key];
      }
      return cur;
    };

    const resolveTemplateString = (
      template: string,
      state: Record<string, RuntimeStateValue>,
    ) => {
      return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_m, rawKey) => {
        const key = String(rawKey ?? "").trim();
        const value = getByPath(state, key);
        if (value === undefined || value === null) {
          return "";
        }
        if (typeof value === "string") {
          return value;
        }
        try {
          return JSON.stringify(value);
        } catch {
          return String(value);
        }
      });
    };

    const runActions = async (actions: RuntimeAction[] | undefined) => {
      const list = Array.isArray(actions) ? actions : [];
      for (const item of list) {
        await onAction(item);
      }
    };

    const onAction = async (action: RuntimeAction) => {
        if (action.type === "set-state") {
          pageStateRef.current = {
            ...pageStateRef.current,
            [action.key]: action.value,
          };
          setPageState(pageStateRef.current);
          return;
        }

        if (action.type === "setState") {
          pageStateRef.current = {
            ...pageStateRef.current,
            [action.key]: action.value,
          };
          setPageState(pageStateRef.current);
          return;
        }

        if (action.type === "navigate") {
          if (action.path.startsWith("page:")) {
            const pagePath = action.path.slice(5);
            setSearchParams((prev) => {
              const nextParams = new URLSearchParams(prev);
              nextParams.set("page", pagePath);
              return nextParams;
            });
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

        if (action.type === "toast") {
          message.open({
            content: action.message,
            type: action.variant ?? "info",
          });
          return;
        }

        if (action.type === "confirm") {
          const ok = window.confirm(action.message);
          if (ok) {
            await runActions(action.onOk);
            return;
          }
          await runActions(action.onCancel);
          throw new Error("ACTION_CANCELLED");
        }

        if (action.type === "when") {
          const stateValue = (pageStateRef.current ?? {})[action.key];
          const op = action.op ?? "truthy";
          const toNumber = (v: unknown) => (typeof v === "number" ? v : Number(v));
          const passed =
            op === "eq"
              ? stateValue === action.value
              : op === "ne"
                ? stateValue !== action.value
                : op === "gt"
                  ? toNumber(stateValue) > toNumber(action.value)
                  : op === "gte"
                    ? toNumber(stateValue) >= toNumber(action.value)
                    : op === "lt"
                      ? toNumber(stateValue) < toNumber(action.value)
                      : op === "lte"
                        ? toNumber(stateValue) <= toNumber(action.value)
                        : op === "includes"
                          ? Array.isArray(stateValue)
                            ? stateValue.includes(action.value as never)
                            : typeof stateValue === "string"
                              ? stateValue.includes(String(action.value ?? ""))
                              : false
                          : op === "falsy"
                            ? !stateValue
                            : !!stateValue;

          if (passed) {
            await runActions(action.onTrue);
          } else {
            await runActions(action.onFalse);
          }
          return;
        }

        if (action.type === "request") {
          const method = (action.method ?? "GET").toUpperCase();
          const headers: Record<string, string> = { ...(action.headers ?? {}) };
          const resolvedUrl = resolveTemplateString(
            action.url,
            pageStateRef.current ?? {},
          );
          const hasContentType = Object.keys(headers).some(
            (key) => key.toLowerCase() === "content-type",
          );

          let body: BodyInit | undefined;
          if (method !== "GET" && method !== "HEAD" && action.body !== undefined) {
            if (typeof action.body === "string") {
              const resolvedBody = resolveTemplateString(
                action.body,
                pageStateRef.current ?? {},
              );
              try {
                const parsed = JSON.parse(resolvedBody);
                body = JSON.stringify(parsed);
                if (!hasContentType) {
                  headers["Content-Type"] = "application/json";
                }
              } catch {
                body = resolvedBody;
                if (!hasContentType) {
                  headers["Content-Type"] = "text/plain;charset=UTF-8";
                }
              }
            } else {
              body = JSON.stringify(action.body);
              if (!hasContentType) {
                headers["Content-Type"] = "application/json";
              }
            }
          }

          Object.keys(headers).forEach((key) => {
            headers[key] = resolveTemplateString(
              String(headers[key]),
              pageStateRef.current ?? {},
            );
          });

          try {
            const resp = await fetch(resolvedUrl, {
              method,
              headers,
              body,
              credentials: "include",
            });
            const contentType = resp.headers.get("content-type") ?? "";
            const data = contentType.includes("application/json")
              ? await resp.json()
              : await resp.text();

            if (resp.ok) {
              if (action.saveToStateKey) {
                const nextValue = action.responsePath
                  ? getByPath(data, action.responsePath)
                  : data;
                pageStateRef.current = {
                  ...pageStateRef.current,
                  [action.saveToStateKey]: nextValue,
                };
                setPageState(pageStateRef.current);
              }
              await runActions(action.onSuccess);
              return;
            }

            if (Array.isArray(action.onError) && action.onError.length) {
              await runActions(action.onError);
              return;
            }

            const errorMessage =
              typeof data === "string" ? data : `Request failed: ${resp.status}`;
            message.open({ content: errorMessage, type: "error" });
            throw new Error(errorMessage);
          } catch (err) {
            if (Array.isArray(action.onError) && action.onError.length) {
              await runActions(action.onError);
              return;
            }
            message.open({
              content: err instanceof Error ? err.message : "请求失败",
              type: "error",
            });
            throw err;
          }
        }

        if (action.type === "scrollTo") {
          const targetElement = document.getElementById(action.targetId);
          targetElement?.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    return { mode: "preview" as const, pageState, onAction };
  }, [pageState, setSearchParams]);

  const canvas = (() => {
    const layoutMode = store.layoutMode === "grid" ? "grid" : "absolute";
    const gridCols = Math.max(1, store.grid?.cols ?? 12);
    const gridRows = Math.max(1, store.grid?.rows ?? 12);
    const gridGap = Math.max(0, store.grid?.gap ?? 0);
    const minHeight = Math.max(700, store.canvasHeight, componentTree.length * 220);

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
        Boolean((parent.props as Record<string, unknown> | undefined)?.contentUseGrid);
      const shouldUseGrid = layoutMode === "grid" && (isRootNode || parentUseGrid);

      const wrapperStyle: Record<string, string | number | undefined> = shouldUseGrid
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

    return (
      <div
        className="relative"
        style={{
          minHeight: `${minHeight}px`,
          ...(layoutMode === "grid"
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
        {componentTree.map((node) => renderTreeNode(node, null, true))}
      </div>
    );
  })();

  return canvas;
});

export default observer(function Preview() {
  const nav = useNavigate();
  const { store } = useStorePage();
  const { getPages, serializeSchema } = useEditorComponents();
  const [searchParams, setSearchParams] = useSearchParams();
  const pages = getPages.get();
  const requestedPagePath = searchParams.get("page");
  const activePage = useMemo(
    () => resolvePreviewPage(pages, requestedPagePath),
    [pages, requestedPagePath],
  );
  const shouldUseAdminShell = pages.length > 0;
  const shouldStretchShellContent = shouldUseAdminShell && store.deviceType !== "mobile";
  const { containerRef, scale, scaledWidth, scaledHeight } = useFitScale({
    contentWidth: store.canvasWidth,
    contentHeight: store.canvasHeight,
    padding: store.deviceType === "mobile" ? 12 : 0,
    maxScale: 3,
  });

  const handleSelectPagePath = (path: string) => {
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      nextParams.set("page", path);
      return nextParams;
    });
  };

  const content = shouldStretchShellContent ? (
    <div className="h-full w-full overflow-auto bg-white text-left">
      <div
        className="min-h-full"
        style={{ minWidth: store.canvasWidth, minHeight: store.canvasHeight }}
      >
        <PreviewCanvas />
      </div>
    </div>
  ) : (
    <div
      ref={containerRef}
      className={`h-full w-full flex items-center justify-center ${
        store.deviceType === "mobile" ? "p-3" : "p-0"
      }`}
    >
      <div className="relative" style={{ width: scaledWidth, height: scaledHeight }}>
        <div
          className={`bg-white text-left overflow-y-auto overflow-x-hidden scrollbar-hide ${
            store.deviceType === "mobile"
              ? "rounded-[30px] border-[8px] border-slate-800 shadow-2xl"
              : "rounded-none border-0 shadow-none"
          }`}
          style={{
            width: store.canvasWidth,
            height: store.canvasHeight,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {store.deviceType === "mobile" && (
            <div className="sticky top-0 z-50 flex h-6 items-center justify-between bg-black/90 px-4 font-mono text-[10px] text-white">
              <span>9:41</span>
              <div className="flex gap-1">
                <div className="h-3 w-3 rounded-full bg-white/20" />
                <div className="h-3 w-3 rounded-full bg-white/20" />
              </div>
            </div>
          )}
          <PreviewCanvas />
        </div>
      </div>
    </div>
  );

  if (shouldUseAdminShell) {
    return (
      <div className="h-screen overflow-hidden bg-slate-50">
        <AdminShell
          pages={pages}
          pageGroups={serializeSchema().pageGroups ?? []}
          activePagePath={activePage?.path ?? null}
          onSelectPagePath={handleSelectPagePath}
          title={store.title || "管理后台"}
          layout={store.shellLayout}
        >
          {content}
        </AdminShell>
        <FloatButton icon={<CaretLeftOutlined />} onClick={() => nav(-1)} />
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-50">
      <div
        className="h-full w-full"
      >
        {content}
      </div>
      <FloatButton icon={<CaretLeftOutlined />} onClick={() => nav(-1)} />
    </div>
  );
});
