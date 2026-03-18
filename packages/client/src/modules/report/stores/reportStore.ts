import { makeAutoObservable } from "mobx";
import type { Widget } from "../types/index";
import { chartTemplates } from "../types/widgetTemplates";

class ReportStore {
  widgets: Widget[] = [];
  selectedId: string | null = null;

  dataSources = [
    {
      id: "ds_sales",
      name: "sales",
      data: [
        { month: "Jan", sales: 120, profit: 30 },
        { month: "Feb", sales: 200, profit: 60 },
        { month: "Mar", sales: 150, profit: 50 },
      ],
    },
    {
      id: "ds_pie",
      name: "pie",
      data: [
        { name: "A", value: 40 },
        { name: "B", value: 20 },
        { name: "C", value: 30 },
      ],
    },
    {
      id: "ds_dept",
      name: "dept",
      data: [
        { dept: "研发", value: 100, target: 120, rate: "83%" },
        { dept: "销售", value: 180, target: 160, rate: "112%" },
      ],
    },
  ];

  constructor() {
    makeAutoObservable(this);
  }

  get selected() {
    return this.widgets.find((w) => w.id === this.selectedId);
  }

  getDs(id: string) {
    return this.dataSources.find((d) => d.id === id)?.data || [];
  }

  addWidget(template: any) {
    const id = crypto.randomUUID();

    this.widgets.push({
      id,
      type: template.type,
      config: { ...template.config },
      gridPos: { ...template.config.gridPos },
    });

    return id;
  }

  initDefaultWidgets() {
    if (this.widgets.length) return;
    this.addWidget(chartTemplates[0]);
    this.addWidget(chartTemplates[1]);
  }

  removeWidget(id: string) {
    this.widgets = this.widgets.filter((w) => w.id !== id);
    if (this.selectedId === id) {
      this.selectedId = null;
    }
  }

  clearAll() {
    this.widgets = [];
    this.selectedId = null;
  }

  calcKpi(config: any) {
    const ds = this.getDs(config.dsId);

    const field = config.field;

    const arr = ds.map((r) => (r as any)[field]);

    if (config.agg === "count_gt") {
      return arr.filter((v) => Number(v) > 100).length;
    }

    if (!arr.length) return 0;

    if (config.agg === "avg")
      return arr.reduce((a, b) => a + b, 0) / arr.length;

    if (config.agg === "max") return Math.max(...arr);

    return arr.reduce((a, b) => a + b, 0);
  }
}

export const reportStore = new ReportStore();
