import React from "react";
import { Card } from "antd";
import { EditOutlined, PictureOutlined } from "@ant-design/icons";
import { pageStore } from "../../stores/pageStore";

const widgets = [
  {
    type: "text",
    label: "文本块",
    icon: <EditOutlined />,
    defaultStyle: {
      width: 200,
      height: 48,
      background: "transparent",
      color: "#09090b",
      fontSize: 14,
      content: "双击编辑文字",
    },
  },
  {
    type: "image",
    label: "图片",
    icon: <PictureOutlined />,
    defaultStyle: {
      width: 200,
      height: 140,
      background: "#f4f4f5",
      src: "",
    },
  },
];

const WidgetPalette: React.FC = () => {
  const onDragStart = (e: React.DragEvent, widget: any) => {
    e.dataTransfer.setData("widget", JSON.stringify(widget));
  };

  return (
    <div style={{ padding: 8 }}>
      {widgets.map((w) => (
        <Card
          key={w.type}
          size="small"
          draggable
          style={{ marginBottom: 8, cursor: "grab" }}
          onDragStart={(e) => onDragStart(e, w)}
          onDoubleClick={() => pageStore.addNode(w)}
        >
          {w.icon} {w.label}
        </Card>
      ))}
    </div>
  );
};

export default WidgetPalette;












