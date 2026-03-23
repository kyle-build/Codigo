import React from "react";
import { Layout } from "antd";
import { observer } from "mobx-react-lite";
import WidgetPalette from "./WidgetPalette";
import Canvas from "./Canvas";
import PropsPanel from "./PropsPanel";

const { Sider, Content } = Layout;

const PageBuilder: React.FC = observer(() => {
  return (
    <Layout style={{ height: "100%" }}>
      <Sider width={180}>
        <WidgetPalette />
      </Sider>

      <Content>
        <Canvas />
      </Content>

      <Sider width={260}>
        <PropsPanel />
      </Sider>
    </Layout>
  );
});

export default PageBuilder;












