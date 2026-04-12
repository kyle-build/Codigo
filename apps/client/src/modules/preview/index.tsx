import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useRef, useState } from "react";
import { FloatButton } from "antd";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CaretLeftOutlined } from "@ant-design/icons";
import {
  generateComponent,
  resolveInitialPageState,
  type RuntimeAction,
} from "@/modules/editor/runtime";
import { useStorePage } from "@/shared/hooks";
import { useEditorComponents } from "@/modules/editor/hooks";
import type { ComponentNode, IEditorPageSchema } from "@codigo/schema";

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
  const [searchParams, setSearchParams] = useSearchParams();
  const hasInitializedRef = useRef(false);
  const pages = getPages.get();
  const activePage = useMemo(
    () => resolvePreviewPage(pages, searchParams.get("page")),
    [pages, searchParams],
  );
  const componentTree = activePage?.components ?? [];
  const initialPageState = useMemo(
    () => resolveInitialPageState(componentTree),
    [componentTree],
  );
  const [pageState, setPageState] = useState(initialPageState);

  useEffect(() => {
    if (hasInitializedRef.current) {
      return;
    }

    hasInitializedRef.current = true;
    void loadPageData(undefined, { silent: true });
  }, [loadPageData]);

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

        const targetElement = document.getElementById(action.targetId);
        targetElement?.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    }),
    [pageState, setSearchParams],
  );

  return (
    <div
      className="relative"
      style={{
        minHeight: `${Math.max(700, componentTree.length * 220)}px`,
      }}
    >
      {componentTree.map(function renderTreeNode(node: ComponentNode) {
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
});

export default observer(function Preview() {
  const nav = useNavigate();
  const { store } = useStorePage();

  return (
    <div className="w-screen h-screen flex items-center justify-center overflow-hidden bg-slate-50">
      <div
        className={`bg-white text-left overflow-y-auto overflow-x-hidden shadow-2xl transition-all duration-300 ${
          store.deviceType === "mobile"
            ? "rounded-[30px] border-[8px] border-slate-800 scrollbar-hide"
            : "rounded-lg border border-slate-200"
        }`}
        style={{
          width: store.canvasWidth,
          height: store.canvasHeight,
        }}
      >
        {store.deviceType === "mobile" && (
          <div className="sticky top-0 z-50 h-6 bg-black/90 text-white text-[10px] flex items-center justify-between px-4 font-mono">
            <span>9:41</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-white/20 rounded-full"></div>
              <div className="w-3 h-3 bg-white/20 rounded-full"></div>
            </div>
          </div>
        )}
        <PreviewCanvas />
        <FloatButton icon={<CaretLeftOutlined />} onClick={() => nav(-1)} />
      </div>
    </div>
  );
});
