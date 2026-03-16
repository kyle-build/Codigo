export const chartTemplates = [
  {
    type: "bar",
    label: "柱状图",
    config: {
      dsId: "ds_sales",
      title: "月度销售",
      xField: "month",
      yField: "sales",
      color: "#2563eb",
      gridPos: { x: 0, y: 0, w: 12, h: 8 },
    },
  },
  {
    type: "line",
    label: "折线图",
    config: {
      dsId: "ds_sales",
      title: "利润趋势",
      xField: "month",
      yField: "profit",
      color: "#16a34a",
      gridPos: { x: 0, y: 0, w: 12, h: 8 },
    },
  },
  {
    type: "pie",
    label: "饼图",
    config: {
      dsId: "ds_pie",
      title: "品类占比",
      nameField: "name",
      valueField: "value",
      gridPos: { x: 0, y: 0, w: 8, h: 8 },
    },
  },
  {
    type: "kpi",
    label: "KPI",
    config: {
      dsId: "ds_sales",
      title: "年度销售",
      field: "sales",
      color: "#2563eb",
      gridPos: { x: 0, y: 0, w: 4, h: 3 },
    },
  },
  {
    type: "table",
    label: "数据表",
    config: {
      dsId: "ds_dept",
      title: "部门数据",
      columns: ["dept", "value", "target", "rate"],
      gridPos: { x: 0, y: 0, w: 12, h: 8 },
    },
  },
];
