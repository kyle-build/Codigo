import type {
  ComponentNode,
  ComponentNodeRecord,
  IEditorPageSchema,
  IEditorPageGroupSchema,
} from "@codigo/schema";
import { makeAutoObservable } from "mobx";

interface IStoreComponents {
  compConfigs: Record<string, ComponentNodeRecord>;
  sortableCompConfig: string[];
  currentCompConfig: string | null;
  selectedCompIds: string[];
  copyedCompConig: ComponentNode | ComponentNode[] | null;
  itemsExpandIndex: number;
  pages: IEditorPageSchema[];
  pageGroups: IEditorPageGroupSchema[];
  activePageId: string | null;
}

/**
 * 创建编辑器组件状态仓库。
 */
export function createEditorComponentsStore() {
  return makeAutoObservable<IStoreComponents>({
    compConfigs: {},
    sortableCompConfig: [],
    currentCompConfig: null,
    selectedCompIds: [],
    copyedCompConig: null,
    itemsExpandIndex: 0,
    pages: [],
    pageGroups: [],
    activePageId: null,
  });
}

export type TEditorComponentsStore = ReturnType<
  typeof createEditorComponentsStore
>;
