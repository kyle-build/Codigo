export type WidgetType =
  | "bar"
  | "line"
  | "pie"
  | "hbar"
  | "area"
  | "kpi"
  | "table";

export interface GridPos {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WidgetConfig {
  dsId: string;
  title: string;
  color?: string;

  xField?: string;
  yField?: string;

  nameField?: string;
  valueField?: string;

  field?: string;
  agg?: string;

  columns?: string[];
}

export interface Widget {
  id: string;
  type: WidgetType;
  config: WidgetConfig;
  gridPos: GridPos;
}












