import type { ComponentEventMap, ComponentMeta, TComponentTypes } from "../schema/components";
import type {
  IEditorPageGroupSchema,
  PageCategory,
  PageGridConfig,
  PageLayoutMode,
  PageShellLayout,
} from "../schema/low-code";

export type TemplateDeviceType = "pc" | "mobile";

export interface TemplateComponent {
  type: TComponentTypes;
  children?: TemplateComponent[];
  events?: ComponentEventMap;
  meta?: ComponentMeta;
  name?: string;
  props?: Record<string, unknown>;
  slot?: string;
  styles?: Record<string, unknown>;
}

export interface TemplatePagePreset {
  name: string;
  path: string;
  components: TemplateComponent[];
}

export interface TemplatePreset {
  key: string;
  name: string;
  desc: string;
  tags: string[];
  pageTitle: string;
  pageCategory: PageCategory;
  layoutMode: PageLayoutMode;
  grid?: PageGridConfig;
  shellLayout?: PageShellLayout;
  deviceType: TemplateDeviceType;
  canvasWidth: number;
  canvasHeight: number;
  activePagePath: string;
  pageGroups?: Pick<IEditorPageGroupSchema, "id" | "name" | "path">[];
  pages: TemplatePagePreset[];
}
