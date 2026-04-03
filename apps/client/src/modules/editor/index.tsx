import { useRef } from "react";
import { useTitle } from "ahooks";
import { observer } from "mobx-react-lite";
import { useSearchParams } from "react-router-dom";
import { EditorViewport } from "./components/shell/EditorViewport";
import { useEditorBootstrap } from "./components/shell/useEditorBootstrap";

import {
  useStoreComponents,
  useStorePage,
  useStorePermission,
  useStoreAuth,
} from "@/shared/hooks";

const Editor = observer(() => {
  useTitle("codigo - 页面编辑");
  const [searchParams, setSearchParams] = useSearchParams();
  const pageId = Number(searchParams.get("id"));

  const { store: storeComps, loadPageData } = useStoreComponents();
  const { store: storePage } = useStorePage();
  const { initCollaboration, cleanupCollaboration } = useStorePermission();
  const { store: storeAuth } = useStoreAuth();
  const canvasRef = useRef<any>(null);

  useEditorBootstrap({
    pageId,
    currentPageQueryId: searchParams.get("id"),
    setSearchParams,
    loadPageData,
    initCollaboration,
    cleanupCollaboration,
    authUserId: storeAuth.details?.id,
    authUsername: storeAuth.details?.username,
  });

  return (
    <EditorViewport
      storeComps={storeComps}
      storePage={storePage}
      canvasRef={canvasRef}
    />
  );
});

export default Editor;
