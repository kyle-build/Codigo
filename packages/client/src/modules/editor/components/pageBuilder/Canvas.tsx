import React, { useRef } from "react";
import { observer } from "mobx-react-lite";
import { pageStore } from "../../stores/pageStore";

const Canvas: React.FC = observer(() => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const onDrop = (e: React.DragEvent) => {
    const data = e.dataTransfer.getData("widget");
    if (!data) return;

    const widget = JSON.parse(data);

    const rect = canvasRef.current!.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    pageStore.addNode(widget, x, y);
  };

  return (
    <div
      ref={canvasRef}
      style={{
        position: "relative",
        height: "100%",
        background: "#fafafa",
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      {pageStore.nodes.map((node) => {
        return (
          <div
            key={node.id}
            style={{
              position: "absolute",
              left: node.x,
              top: node.y,
              width: node.style.width,
              height: node.style.height,
              background: node.style.background,
            }}
          >
            {node.type === "text" && node.style.content}

            {node.type === "image" && (
              <img
                src={node.style.src}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
});

export default Canvas;












