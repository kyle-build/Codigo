import { action, computed } from "mobx";
import { message } from "antd";
import { ulid } from "ulid";
import type { ComponentNode, IEditorPageSchema, PageCategory } from "@codigo/schema";
import type { PageLayoutPresetKey } from "@/modules/editor/registry/components";
import type { TEditorComponentsStore } from "@/modules/editor/stores";
import { createPageLayoutPreset } from "@/modules/editor/utils/pageLayout";
import {
  createEditorPageDefinition,
  ensureUniquePagePath,
  normalizeFromSchema,
  serializeComponentTree,
  serializeStore,
} from "@/modules/editor/utils/pageSchema";

type InsertNodeArgs = {
  parentId?: string | null;
  slot?: string | null;
  index?: number;
};

interface EditorComponentPageActionsContext {
  storeComponents: TEditorComponentsStore;
  pageStore: {
    layoutMode: "absolute";
    pageCategory: PageCategory;
    canvasWidth: number;
  };
  ensurePermission: (permission: any, deniedMessage?: string) => boolean;
  addOperationLog: (action: any, detail: string) => void;
  broadcastReplaceAll: () => void;
  setCurrentComponent: (id: string) => void;
  insertNodeTree: (node: ComponentNode, args?: InsertNodeArgs) => void;
}

/**
 * 创建 editor 页面域相关的读写能力。
 */
export function createEditorComponentPageActions(
  context: EditorComponentPageActionsContext,
) {
  const {
    addOperationLog,
    broadcastReplaceAll,
    ensurePermission,
    insertNodeTree,
    pageStore,
    setCurrentComponent,
    storeComponents,
  } = context;

  /**
   * 确保编辑器至少存在一个可编辑页面。
   */
  const ensureEditorPages = action(() => {
    if (storeComponents.pages.length) {
      if (
        storeComponents.activePageId &&
        storeComponents.pages.some((page) => page.id === storeComponents.activePageId)
      ) {
        return;
      }

      storeComponents.activePageId = storeComponents.pages[0]?.id ?? null;
      return;
    }

    const initialPage = createEditorPageDefinition([], {
      id: storeComponents.activePageId ?? ulid(),
      components: serializeComponentTree(storeComponents),
    });

    storeComponents.pages = [initialPage];
    storeComponents.activePageId = initialPage.id;
  });

  /**
   * 获取编辑器内的全部页面快照。
   */
  const getPages = computed(() => {
    ensureEditorPages();
    return serializeStore(storeComponents).pages ?? [];
  });

  /**
   * 获取当前激活的页面。
   */
  const getActivePage = computed(() => {
    return (
      getPages.get().find((page) => page.id === storeComponents.activePageId) ??
      getPages.get()[0] ??
      null
    );
  });

  /**
   * 从页面快照恢复当前画布。
   */
  const hydrateCanvasFromPage = action((page: IEditorPageSchema) => {
    const normalized = normalizeFromSchema(
      {
        version: 3,
        components: page.components ?? [],
      },
      pageStore.layoutMode,
    );

    storeComponents.compConfigs = normalized.compConfigs;
    storeComponents.sortableCompConfig = normalized.sortableCompConfig;
    storeComponents.currentCompConfig = normalized.sortableCompConfig[0] ?? null;
    storeComponents.activePageId = page.id;
  });

  /**
   * 把当前画布回写到当前激活页面快照。
   */
  const persistActivePageSnapshot = action(() => {
    ensureEditorPages();
    const snapshot = serializeComponentTree(storeComponents);
    storeComponents.pages = getPages.get().map((page) =>
      page.id === storeComponents.activePageId
        ? {
            ...page,
            components: snapshot,
          }
        : page,
    );
  });

  /**
   * 切换当前正在编辑的页面。
   */
  const switchEditorPage = action((pageId: string) => {
    ensureEditorPages();
    if (
      !pageId ||
      pageId === storeComponents.activePageId ||
      !getPages.get().some((page) => page.id === pageId)
    ) {
      return;
    }

    persistActivePageSnapshot();
    const targetPage = getPages.get().find((page) => page.id === pageId);
    if (!targetPage) {
      return;
    }

    hydrateCanvasFromPage(targetPage);
    broadcastReplaceAll();
    addOperationLog("update_page", `切换到${targetPage.name}`);
  });

  /**
   * 新建一个 editor 页面并切换过去。
   */
  const createEditorPage = action(() => {
    if (!ensurePermission("edit_structure", "当前角色不能新增页面")) {
      return null;
    }

    ensureEditorPages();
    persistActivePageSnapshot();
    const pages = getPages.get();
    const nextPage = createEditorPageDefinition(pages);
    storeComponents.pages = [...pages, nextPage];
    hydrateCanvasFromPage(nextPage);
    broadcastReplaceAll();
    addOperationLog("update_page", `新增页面:${nextPage.name}`);
    return nextPage;
  });

  /**
   * 更新页面的名称或路径元数据。
   */
  const updateEditorPageMeta = action(
    (pageId: string, patch: Partial<Pick<IEditorPageSchema, "name" | "path">>) => {
      if (!ensurePermission("edit_content", "当前角色不能修改页面信息")) {
        return;
      }

      ensureEditorPages();
      persistActivePageSnapshot();
      const nextPages = getPages.get().map((page) => {
        if (page.id !== pageId) {
          return page;
        }

        return {
          ...page,
          name: patch.name?.trim() || page.name,
          path: patch.path
            ? ensureUniquePagePath(getPages.get(), patch.path, pageId)
            : page.path,
        };
      });

      storeComponents.pages = nextPages;
      broadcastReplaceAll();
      addOperationLog("update_page", patch.path ? "页面路径" : "页面名称");
    },
  );

  /**
   * 套用页面布局骨架预设。
   */
  const applyLayoutPreset = action((preset: PageLayoutPresetKey) => {
    if (!ensurePermission("edit_structure", "当前角色不能创建页面布局")) {
      return;
    }

    const wasEmpty = storeComponents.sortableCompConfig.length === 0;
    const presetTree = createPageLayoutPreset(
      preset,
      pageStore.pageCategory,
      pageStore.canvasWidth,
    );
    const insertStartIndex = storeComponents.sortableCompConfig.length;

    presetTree.nodes.forEach((node, index) => {
      insertNodeTree(node, {
        index: insertStartIndex + index,
      });
    });

    if (presetTree.focusId) {
      setCurrentComponent(presetTree.focusId);
    }

    broadcastReplaceAll();
    message.success(
      wasEmpty
        ? "已创建页面布局，直接把组件拖到布局区域即可"
        : "已插入布局骨架，可把现有组件拖到新的布局区域",
    );
    addOperationLog("add_component", `layout:${preset}`);
  });

  /**
   * 清空当前页面的全部画布节点。
   */
  const clearActivePageCanvas = action(() => {
    if (!ensurePermission("edit_structure", "当前角色不能清空画布")) {
      return;
    }

    ensureEditorPages();
    if (!storeComponents.sortableCompConfig.length) {
      message.info("当前画布已经是空的");
      return;
    }

    storeComponents.compConfigs = {};
    storeComponents.sortableCompConfig = [];
    storeComponents.currentCompConfig = null;
    storeComponents.pages = getPages.get().map((page) =>
      page.id === storeComponents.activePageId
        ? {
            ...page,
            components: [],
          }
        : page,
    );

    broadcastReplaceAll();
    message.success("已清空当前画布");
    addOperationLog("remove_component", "清空画布");
  });

  return {
    applyLayoutPreset,
    clearActivePageCanvas,
    createEditorPage,
    ensureEditorPages,
    getActivePage,
    getPages,
    hydrateCanvasFromPage,
    persistActivePageSnapshot,
    switchEditorPage,
    updateEditorPageMeta,
  };
}
