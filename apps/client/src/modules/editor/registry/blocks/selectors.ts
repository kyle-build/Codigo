import type { PageCategory } from "@codigo/schema";
import { editorBlockCatalog } from "./catalog";
import type { EditorBlockSection, EditorBlockSectionKey } from "./types";

const sectionLabelMap: Record<EditorBlockSectionKey, string> = {
  layout: "布局",
  data: "列表",
  stats: "统计",
};

const sectionOrder: EditorBlockSectionKey[] = ["layout", "data", "stats"];

export function getEditorBlockSections(pageCategory: PageCategory) {
  return sectionOrder.map((key) => ({
    key,
    label: sectionLabelMap[key],
    items: editorBlockCatalog.filter(
      (item) =>
        item.sectionKey === key &&
        (!item.categories?.length || item.categories.includes(pageCategory)),
    ),
  })) as EditorBlockSection[];
}

export function findEditorBlock(id?: string | null) {
  if (!id) {
    return null;
  }
  return editorBlockCatalog.find((item) => item.id === id) ?? null;
}

