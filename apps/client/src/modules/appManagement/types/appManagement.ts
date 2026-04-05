import type { ComponentNode } from "@codigo/schema";
import type { ReactNode } from "react";

export interface AppManagementPageRecord {
  id: number;
  page_name: string;
  desc?: string | null;
}

export interface PublicPageItem extends AppManagementPageRecord {
  owner_name: string;
  owner_head_img?: string | null;
  version_count: number;
  latest_version: number;
  latest_published_at?: string | null;
}

export interface PageVersionItem {
  id: string;
  page_id: number;
  version: number;
  desc: string;
  created_at: string;
}

export interface MyPagePayload {
  page: AppManagementPageRecord | null;
  versions: PageVersionItem[];
}

export interface PreviewSchema {
  version: number;
  components: ComponentNode[];
}

export interface PreviewState {
  title: string;
  subtitle: string;
  schema: PreviewSchema;
}

export interface LocalDraftMeta {
  hasDraft: boolean;
  isUpdatedAfterPublish: boolean;
  updatedAt: string;
}

export interface AppManagementMetric {
  label: string;
  value: string;
}

export interface AppManagementNavItem {
  description: string;
  icon: ReactNode;
  key: AppManagementTab;
  label: string;
  title: string;
}

export type AppManagementTab =
  | "developing"
  | "published"
  | "versions"
  | "templates";
