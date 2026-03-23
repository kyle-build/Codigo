export interface StudioModule {
  name: string;
  label: string;
  path: string;
}

export const studioModules: StudioModule[] = [
  { name: "form", label: "Form", path: "/form" },
  { name: "page", label: "Page", path: "/page" },
  { name: "flow", label: "Flow", path: "/flow" },
  { name: "report", label: "Report", path: "/report" },
];












