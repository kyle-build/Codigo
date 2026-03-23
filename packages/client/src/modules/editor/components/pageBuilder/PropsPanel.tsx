import React from "react";
import { observer } from "mobx-react-lite";
import { InputNumber, Divider } from "antd";
import { pageStore } from "../../stores/pageStore";

const PropsPanel: React.FC = observer(() => {
  const node = pageStore.selected;

  if (!node) return <div style={{ padding: 20 }}>选择组件</div>;

  return (
    <div style={{ padding: 16 }}>
      <Divider>位置</Divider>

      <div>
        X:
        <InputNumber
          value={node.x}
          onChange={(v) => pageStore.updatePosition(node.id, v!, node.y)}
        />
      </div>

      <div>
        Y:
        <InputNumber
          value={node.y}
          onChange={(v) => pageStore.updatePosition(node.id, node.x, v!)}
        />
      </div>

      <Divider>尺寸</Divider>

      <div>
        宽:
        <InputNumber
          value={node.style.width}
          onChange={(v) =>
            pageStore.updateSize(node.id, v!, node.style.height ?? 0)
          }
        />
      </div>

      <div>
        高:
        <InputNumber
          value={node.style.height}
          onChange={(v) =>
            pageStore.updateSize(node.id, node.style.width ?? 0, v!)
          }
        />
      </div>
    </div>
  );
});

export default PropsPanel;












