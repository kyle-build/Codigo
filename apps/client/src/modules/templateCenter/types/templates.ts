import type {
  PageCategory,
  PageLayoutMode,
  TComponentTypes,
} from "@codigo/schema";

export interface TemplateComponent {
  type: TComponentTypes;
  props?: Record<string, unknown>;
  styles?: Record<string, unknown>;
}

export interface TemplatePreset {
  key: string;
  name: string;
  desc: string;
  tags: string[];
  pageTitle: string;
  pageCategory: PageCategory;
  layoutMode: PageLayoutMode;
  deviceType: "pc" | "mobile";
  canvasWidth: number;
  canvasHeight: number;
  components: TemplateComponent[];
}
