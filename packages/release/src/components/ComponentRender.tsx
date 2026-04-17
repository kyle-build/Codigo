"use client";

import {
  buildComponentTree,
  groupChildrenBySlot,
  type ComponentNode,
  type GetReleaseDataResponse,
  type TComponentTypes,
  getComponentByType,
  initBuiltinComponents,
} from "@codigo/materials";
import type { ActionConfig, IPageSchema, RuntimeStateValue } from "@codigo/schema";
import { useRequest } from "ahooks";
import { useImmer } from "use-immer";
import { useEffect, useMemo, useRef, useState } from "react";
import { message, Button } from "antd";
import AdminShell from "./AdminShell";

initBuiltinComponents();

const usingInputType = ["input", "textArea", "radio", "checkbox"];
interface LegacyRuntimeAction {
  type: "set-state";
  key: string;
  value: RuntimeStateValue;
}

type RuntimeAction = ActionConfig | LegacyRuntimeAction;

function getClickActions(node: ComponentNode): RuntimeAction[] {
  const configuredActions = Array.isArray(node.events?.onClick)
    ? node.events.onClick
    : [];
  const props = (node.props ?? {}) as Record<string, unknown>;
  const legacyActions: RuntimeAction[] = [];

  if (
    props.actionType === "set-state" &&
    typeof props.stateKey === "string" &&
    props.stateKey &&
    props.stateValue !== undefined
  ) {
    legacyActions.push({
      type: "setState",
      key: props.stateKey,
      value: props.stateValue as RuntimeStateValue,
    });
  }

  if (props.actionType === "open-url" && typeof props.link === "string") {
    if (props.link.startsWith("#")) {
      legacyActions.push({
        type: "scrollTo",
        targetId: props.link.slice(1),
      });
    } else if (props.link) {
      legacyActions.push({
        type: "openUrl",
        url: props.link,
        target: "_blank",
      });
    }
  }

  if (
    props.actionType === "scroll-to-id" &&
    typeof props.targetId === "string" &&
    props.targetId
  ) {
    legacyActions.push({
      type: "scrollTo",
      targetId: props.targetId,
    });
  }

  return [...configuredActions, ...legacyActions];
}

function resolveInitialPageState(nodes: ComponentNode[]) {
  const initialState: Record<string, RuntimeStateValue> = {};

  const visitNodes = (items: ComponentNode[]) => {
    items.forEach((node) => {
      getClickActions(node).forEach((action) => {
        if (
          action.type === "setState" &&
          action.key &&
          initialState[action.key] === undefined
        ) {
          initialState[action.key] = action.value;
        }
      });

      if (node.children?.length) {
        visitNodes(node.children);
      }
    });
  };

  visitNodes(nodes);
  return initialState;
}

function generateComponent(
  conf: { id: string; type: TComponentTypes; props: Record<string, any> },
  onUpdate: (value: any) => void,
  onAction: (action: RuntimeAction) => void | Promise<void>,
  pageState: Record<string, RuntimeStateValue>,
  slots?: Record<string, any[]>,
  editorNodeId?: string,
) {
  const Component = getComponentByType(conf.type);

  if (!usingInputType.includes(conf.type))
    return (
      <Component
        {...conf.props}
        key={conf.id}
        onAction={onAction}
        runtimePageState={pageState}
        slots={slots}
        editorNodeId={editorNodeId}
      />
    );
  else
    return (
      <Component
        {...conf.props}
        key={conf.id}
        onUpdate={onUpdate}
        onAction={onAction}
        runtimePageState={pageState}
        slots={slots}
        editorNodeId={editorNodeId}
      />
    );
}

function getQuestionComponentValueField(component: any) {
  switch (component.type) {
    case "input":
    case "textArea":
      return "text";
    case "radio":
      return "defaultRadio";
    case "checkbox":
      return "defaultChecked";
    default:
      return null;
  }
}

interface ComponentRenderType {
  id: string;
  data: GetReleaseDataResponse;
  initialPagePath?: string | null;
}

function resolveRuntimeSchema(data: GetReleaseDataResponse): IPageSchema {
  if (data.schema) {
    return {
      version: data.schema.version ?? 3,
      components: data.schema.components ?? [],
      pages: data.schema.pages,
      activePageId: data.schema.activePageId,
    };
  }

  return {
    version: data.schema_version ?? 1,
    components: buildComponentTree(
      data.components.map((component) => ({
        id: component.node_id,
        type: component.type,
        name: component.name,
        props: component.options ?? {},
        styles: component.styles,
        slot: component.slot ?? undefined,
        meta: component.meta,
        parentId: component.parent_node_id,
      })),
      data.componentIds,
    ),
  };
}

function resolveActivePage(schema: IPageSchema, requestedPath?: string | null) {
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

export default function ComponentRender({
  data,
  id,
  initialPagePath,
}: ComponentRenderType) {
  const [isPosted, setIsPosted] = useState(false);
  const [localData, setLocalData] = useImmer(
    JSON.parse(JSON.stringify(data)) as ComponentRenderType["data"],
  );
  const runtimeSchema = useMemo(() => resolveRuntimeSchema(localData), [localData]);
  const [currentPagePath, setCurrentPagePath] = useState(initialPagePath ?? null);
  const activePage = useMemo(
    () => resolveActivePage(runtimeSchema, currentPagePath),
    [currentPagePath, runtimeSchema],
  );
  const pageSchema = activePage?.components ?? runtimeSchema.components;

  const componentValueMap = useMemo(() => {
    return new Map(
      localData.components.map((component) => [component.node_id, component]),
    );
  }, [localData.components]);
  const initialPageState = useMemo(() => resolveInitialPageState(pageSchema), [
    pageSchema,
  ]);
  const [pageState, setPageState] = useState(initialPageState);
  const pageStateRef = useRef(pageState);

  useEffect(() => {
    setPageState(initialPageState);
  }, [initialPageState]);

  useEffect(() => {
    pageStateRef.current = pageState;
  }, [pageState]);

  useEffect(() => {
    setCurrentPagePath(initialPagePath ?? null);
  }, [initialPagePath]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const nextUrl = new URL(window.location.href);
    if (currentPagePath) {
      nextUrl.searchParams.set("page", currentPagePath);
    } else {
      nextUrl.searchParams.delete("page");
    }
    window.history.replaceState({}, "", nextUrl.toString());
  }, [currentPagePath]);

  const shouldRenderNode = (node: ComponentNode) => {
    const props = (node.props ?? {}) as Record<string, unknown>;
    if (
      typeof props.visibleStateKey !== "string" ||
      !props.visibleStateKey ||
      props.visibleStateValue === undefined ||
      props.visibleStateValue === ""
    ) {
      return true;
    }

    return pageState[props.visibleStateKey] === props.visibleStateValue;
  };

  const handleAction = async (action: RuntimeAction) => {
    const runActions = async (actions: RuntimeAction[] | undefined) => {
      const list = Array.isArray(actions) ? actions : [];
      for (const item of list) {
        await handleAction(item);
      }
    };

    if (action.type === "set-state" || action.type === "setState") {
      pageStateRef.current = {
        ...pageStateRef.current,
        [action.key]: action.value,
      };
      setPageState(pageStateRef.current);
      return;
    }

    if (action.type === "navigate") {
      if (action.path.startsWith("page:")) {
        setCurrentPagePath(action.path.slice(5));
        return;
      }
      window.location.assign(action.path);
      return;
    }

    if (action.type === "openUrl") {
      window.open(action.url, action.target ?? "_blank", "noopener,noreferrer");
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
        await runActions(action.onOk as RuntimeAction[] | undefined);
        return;
      }
      await runActions(action.onCancel as RuntimeAction[] | undefined);
      throw new Error("ACTION_CANCELLED");
    }

    if (action.type === "when") {
      const stateValue = (pageStateRef.current ?? {})[action.key];
      const op = action.op ?? "truthy";
      const passed =
        op === "eq"
          ? stateValue === action.value
          : op === "ne"
            ? stateValue !== action.value
            : op === "falsy"
              ? !stateValue
              : !!stateValue;

      if (passed) {
        await runActions(action.onTrue as RuntimeAction[] | undefined);
      } else {
        await runActions(action.onFalse as RuntimeAction[] | undefined);
      }
      return;
    }

    if (action.type === "request") {
      const method = (action.method ?? "GET").toUpperCase();
      const headers: Record<string, string> = { ...(action.headers ?? {}) };
      const hasContentType = Object.keys(headers).some(
        (key) => key.toLowerCase() === "content-type",
      );

      let body: BodyInit | undefined;
      if (method !== "GET" && method !== "HEAD" && action.body !== undefined) {
        if (typeof action.body === "string") {
          try {
            const parsed = JSON.parse(action.body);
            body = JSON.stringify(parsed);
            if (!hasContentType) {
              headers["Content-Type"] = "application/json";
            }
          } catch {
            body = action.body;
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

      try {
        const resp = await fetch(action.url, {
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
            pageStateRef.current = {
              ...pageStateRef.current,
              [action.saveToStateKey]: data,
            };
            setPageState(pageStateRef.current);
          }
          await runActions(action.onSuccess as RuntimeAction[] | undefined);
          return;
        }

        if (Array.isArray(action.onError) && action.onError.length) {
          await runActions(action.onError as RuntimeAction[] | undefined);
          return;
        }

        throw new Error(
          typeof data === "string" ? data : `Request failed: ${resp.status}`,
        );
      } catch (err) {
        if (Array.isArray(action.onError) && action.onError.length) {
          await runActions(action.onError as RuntimeAction[] | undefined);
          return;
        }
        throw err;
      }
    }

    const targetElement = document.getElementById(action.targetId);
    targetElement?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  function renderNode(node: ComponentNode) {
    if (!shouldRenderNode(node)) {
      return null;
    }

    const sourceComponent = componentValueMap.get(node.id);
    const runtimeComponent = {
      id: node.id,
      type: node.type,
      props: sourceComponent?.options ?? node.props ?? {},
    };
    const renderedChildrenMap = new Map(
      (node.children ?? []).map((child) => [child.id, renderNode(child)]),
    );
    const groupedSlots = groupChildrenBySlot(node);
    const slots = Object.fromEntries(
      Object.entries(groupedSlots).map(([slotName, nodes]) => [
        slotName,
        nodes
          .map((child) => renderedChildrenMap.get(child.id))
          .filter((item): item is NonNullable<typeof item> => item != null),
      ]),
    );

    const resolvedStyles: Record<string, any> = { ...(node.styles ?? {}) };
    if (
      resolvedStyles.gridColumnStart !== undefined ||
      resolvedStyles.gridRowStart !== undefined
    ) {
      const colStart = Math.max(1, Number(resolvedStyles.gridColumnStart ?? 1));
      const colSpan = Math.max(1, Number(resolvedStyles.gridColumnSpan ?? 1));
      const rowStart = Math.max(1, Number(resolvedStyles.gridRowStart ?? 1));
      const rowSpan = Math.max(1, Number(resolvedStyles.gridRowSpan ?? 1));
      resolvedStyles.gridColumn = `${colStart} / span ${colSpan}`;
      resolvedStyles.gridRow = `${rowStart} / span ${rowSpan}`;
      delete resolvedStyles.gridColumnStart;
      delete resolvedStyles.gridColumnSpan;
      delete resolvedStyles.gridRowStart;
      delete resolvedStyles.gridRowSpan;
    }

    return (
      <div
        key={node.id}
        className="relative"
        onClick={() => {
          const run = async () => {
            for (const action of getClickActions(node)) {
              await handleAction(action);
            }
          };
          void run().catch(() => {});
        }}
        style={{
          ...resolvedStyles,
        }}
      >
        {generateComponent(
          runtimeComponent,
          (value) => {
            setLocalData((draft) => {
              const target = draft.components.find(
                (item) => item.node_id === node.id,
              );
              if (!target) return;
              const questionComponentValueField =
                getQuestionComponentValueField(target);
              if (questionComponentValueField) {
                target.options[questionComponentValueField] = value;
              }
            });
          },
          handleAction,
          pageState,
          slots,
          node.id,
        )}
      </div>
    );
  }

  useRequest(
    async () => {
      const _f = await fetch(
        `${process.env.SERVER_URL!}/api/pages/${data.id}/submissions/me`,
      );
      return _f.json() as Promise<{ data: boolean }>;
    },
    {
      onSuccess: ({ data }) => {
        if (data) {
          setIsPosted(true);
          message.open({ content: "已发布" });
        }
      },
    },
  );

  const { run, loading } = useRequest(
    async () => {
      const isNotCompleted = localData.components.some((comp) => {
        const questionComponentValueField =
          getQuestionComponentValueField(comp);
        if (
          questionComponentValueField &&
          !comp.options[questionComponentValueField]
        )
          return !["defaultRadio", "defaultChecked"].includes(
            questionComponentValueField,
          );

        return false;
      });
      if (isNotCompleted) return { msg: "请填写完整信息", data: false };

      const _f = await fetch(
        `${process.env.SERVER_URL!}/api/pages/${data.id}/submissions`,
        {
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({
            props: localData.components
              .filter((comp) => usingInputType.includes(comp.type))
              .map((comp) => {
                return {
                  id: comp.id,
                  value: comp.options[getQuestionComponentValueField(comp)!],
                };
              }),
          }),
        },
      );

      return _f.json();
    },
    {
      manual: true,
      onSuccess: ({ msg, data }) => {
        if (data !== undefined) {
          message.warning(msg);
        } else {
          message.success(msg);
          setIsPosted(true);
        }
      },
    },
  );

  const content = (
    <div
      className={`${isPosted && "opacity-50 select-none pointer-events-none"}`}
      style={{
        position: "relative",
        ...(data.layoutMode === "grid"
          ? {
              display: "grid",
              gridTemplateColumns: `repeat(${Math.max(1, data.grid?.cols ?? 12)}, minmax(0, 1fr))`,
              gridTemplateRows: `repeat(${Math.max(1, data.grid?.rows ?? 12)}, minmax(0, 1fr))`,
              gap: Math.max(0, data.grid?.gap ?? 0),
              width: data.canvasWidth,
              height: data.canvasHeight,
              maxWidth: "100%",
            }
          : {
              width: data.canvasWidth,
              minHeight: data.canvasHeight,
              maxWidth: "100%",
            }),
      }}
    >
      {pageSchema.map((node) => renderNode(node))}

      {data.components.some((comp) => usingInputType.includes(comp.type)) && (
        <div className="flex items-center justify-center">
          <Button type="primary" onClick={run} loading={loading}>
            提交
          </Button>
        </div>
      )}
    </div>
  );

  if (!Array.isArray(runtimeSchema.pages) || !runtimeSchema.pages.length) {
    return content;
  }

  return (
    <AdminShell
      pages={runtimeSchema.pages}
      activePagePath={activePage?.path ?? null}
      onSelectPagePath={(path) => setCurrentPagePath(path)}
      title={localData.page_name || "管理后台"}
    >
      {content}
    </AdminShell>
  );
}
