import { describe, expect, it, vi } from "vitest";
import type { IEditorPageGroupSchema, IEditorPageSchema } from "@codigo/schema";
import { createEditorComponentPageActions } from "@/modules/editor/hooks/useEditorComponentPages";

function createPage(id: string, name: string, path: string): IEditorPageSchema {
  return {
    id,
    name,
    path,
    components: [],
  };
}

function createPageGroup(
  id: string,
  name: string,
  path: string,
): IEditorPageGroupSchema {
  return { id, name, path };
}

function createStore(
  pages: IEditorPageSchema[],
  activePageId: string,
  pageGroups: IEditorPageGroupSchema[] = [],
) {
  return {
    pages,
    pageGroups,
    activePageId,
    compConfigs: {},
    sortableCompConfig: [],
    currentCompConfig: null,
    selectedCompIds: [],
  } as any;
}

function createActions(
  pages: IEditorPageSchema[],
  activePageId = pages[0]?.id ?? null,
  pageGroups: IEditorPageGroupSchema[] = [],
) {
  return createEditorComponentPageActions({
    storeComponents: createStore(pages, activePageId, pageGroups),
    pageStore: {
      layoutMode: "absolute",
      grid: undefined,
      pageCategory: "pc",
      canvasWidth: 1024,
    } as any,
    ensurePermission: () => true,
    addOperationLog: vi.fn(),
    broadcastReplaceAll: vi.fn(),
    setCurrentComponent: vi.fn(),
    insertNodeTree: vi.fn(),
  });
}

describe("createEditorComponentPageActions", () => {
  it("keeps the current page active when creating a page inside a group without switching", () => {
    const parentPage = createPage("page_home", "首页", "home");
    const pageGroup = createPageGroup("group_system", "系统管理", "system");
    const storeComponents = createStore([parentPage], parentPage.id, [pageGroup]);
    const actions = createEditorComponentPageActions({
      storeComponents,
      pageStore: {
        layoutMode: "absolute",
        grid: undefined,
        pageCategory: "pc",
        canvasWidth: 1024,
      } as any,
      ensurePermission: () => true,
      addOperationLog: vi.fn(),
      broadcastReplaceAll: vi.fn(),
      setCurrentComponent: vi.fn(),
      insertNodeTree: vi.fn(),
    });

    const nextPage = actions.createEditorPage({
      parentGroupPath: pageGroup.path,
      switchToNewPage: false,
    });

    expect(nextPage).not.toBeNull();
    expect(storeComponents.activePageId).toBe(parentPage.id);
    expect(storeComponents.pages).toHaveLength(2);
    expect(storeComponents.pages[1]?.path).toBe("system/page-2");
  });

  it("creates page groups before pages", () => {
    const parentPage = createPage("page_home", "首页", "home");
    const actions = createActions([parentPage], parentPage.id);

    const nextGroup = actions.createEditorPageGroup();

    expect(nextGroup).not.toBeNull();
    expect(actions.getPageGroups.get()).toHaveLength(1);
    expect(actions.getPageGroups.get()[0]?.path).toBe("group-1");
  });
});
