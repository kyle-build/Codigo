import { useEffect } from "react";
import type { SetURLSearchParams } from "react-router-dom";
import { getLowCodePage } from "@/modules/editor/api/low-code";

interface UseEditorBootstrapArgs {
  pageId: number;
  currentPageQueryId: string | null;
  setSearchParams: SetURLSearchParams;
  loadPageData: (
    fetchServerData?: () => Promise<{ data: any }>,
  ) => Promise<any> | void;
  initCollaboration: (
    pageId: number,
    currentUserId: number,
    currentUserName: string,
  ) => void;
  cleanupCollaboration: (pageId: number, currentUserId: number) => void;
  authUserId?: number | null;
  authUsername?: string | null;
}

export function useEditorBootstrap({
  pageId,
  currentPageQueryId,
  setSearchParams,
  loadPageData,
  initCollaboration,
  cleanupCollaboration,
  authUserId,
  authUsername,
}: UseEditorBootstrapArgs) {
  useEffect(() => {
    Promise.resolve(loadPageData(getLowCodePage)).then((data) => {
      if (data?.id && !currentPageQueryId) {
        setSearchParams({ id: String(data.id) }, { replace: true });
      }
    });
  }, [currentPageQueryId, loadPageData, setSearchParams]);

  useEffect(() => {
    if (pageId && authUserId) {
      initCollaboration(pageId, authUserId, authUsername || "User");
    }

    return () => {
      if (pageId && authUserId) {
        cleanupCollaboration(pageId, authUserId);
      }
    };
  }, [authUserId, authUsername, cleanupCollaboration, initCollaboration, pageId]);
}
