import { useEffect, useMemo, useRef } from "react";
import { observer } from "mobx-react-lite";
import { useSearchParams } from "react-router-dom";
import { useStoreAuth } from "@/shared/hooks";
import { BASE_URL } from "@/shared/utils/request";

type WebIDEFrameProps = {
  workspaceRoot?: string | null;
};

function normalizeBaseUrl(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export const WebIDEFrame = observer(function WebIDEFrame(
  props: WebIDEFrameProps,
) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { store: storeAuth } = useStoreAuth();
  const [searchParams] = useSearchParams();
  const pageId = Number(searchParams.get("id"));
  const ideBaseUrl = normalizeBaseUrl(
    import.meta.env.VITE_OPENSUMI_IDE_URL || "http://localhost:8081",
  );
  const ideOrigin = useMemo(() => {
    try {
      return new URL(ideBaseUrl).origin;
    } catch {
      return "*";
    }
  }, [ideBaseUrl]);
  const apiBaseUrl = useMemo(() => {
    const resolved = BASE_URL || window.location.origin;
    return `${normalizeBaseUrl(resolved)}/api`;
  }, []);
  const workspaceRoot = useMemo(() => {
    if (props.workspaceRoot) {
      return props.workspaceRoot;
    }
    if (pageId) {
      return `/codigo/pages/${pageId}`;
    }
    return "/codigo/pages/0";
  }, [pageId, props.workspaceRoot]);

  const iframeUrl = useMemo(() => {
    const url = new URL(`${ideBaseUrl}/`);
    url.searchParams.set("pageId", String(pageId));
    url.searchParams.set("apiBaseUrl", apiBaseUrl);
    url.searchParams.set("workspaceRoot", workspaceRoot);
    return url.toString();
  }, [apiBaseUrl, ideBaseUrl, pageId, workspaceRoot]);

  useEffect(() => {
    const postContext = () => {
      const targetWindow = iframeRef.current?.contentWindow;
      if (!targetWindow) {
        return;
      }
      targetWindow.postMessage(
        {
          type: "codigo:opensumi-app-context",
          payload: {
            token: storeAuth.token,
            pageId,
            apiBaseUrl,
          },
        },
        ideOrigin,
      );
    };

    const onMessage = (event: MessageEvent<{ type?: string }>) => {
      if (ideOrigin !== "*" && event.origin !== ideOrigin) {
        return;
      }
      if (event.data?.type !== "codigo:opensumi-app-ready") {
        return;
      }
      postContext();
    };

    window.addEventListener("message", onMessage);
    postContext();

    return () => {
      window.removeEventListener("message", onMessage);
    };
  }, [apiBaseUrl, ideOrigin, pageId, storeAuth.token]);

  if (!pageId) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-[var(--ide-text-muted)]">
        当前页面未初始化，暂时无法打开 IDE
      </div>
    );
  }

  return (
    <iframe
      ref={iframeRef}
      title="codigo-webide"
      src={iframeUrl}
      className="h-full w-full border-0 bg-[var(--ide-bg)]"
      allow="clipboard-read; clipboard-write"
    />
  );
});
