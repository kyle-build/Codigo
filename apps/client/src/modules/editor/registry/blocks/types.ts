import type { PageCategory, TBasicComponentConfig, TComponentTypes } from "@codigo/schema";
import type { ReactNode } from "react";

export type EditorBlockSectionKey = "layout" | "data" | "stats";

export interface EditorBlockNodeTemplate {
  type: TComponentTypes;
  props?: Record<string, unknown>;
  styles?: TBasicComponentConfig["styles"];
  events?: Record<string, unknown>;
  slot?: string;
  children?: EditorBlockNodeTemplate[];
}

export interface EditorBlockMeta {
  id: string;
  name: string;
  description?: string;
  icon: ReactNode;
  sectionKey: EditorBlockSectionKey;
  categories?: PageCategory[];
  anchorType: TComponentTypes;
  nodes: EditorBlockNodeTemplate[];
}

export interface EditorBlockSection {
  key: EditorBlockSectionKey;
  label: string;
  items: EditorBlockMeta[];
}

