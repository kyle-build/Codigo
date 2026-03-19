import { Tabs } from "antd";
import {
  AppstoreOutlined,
  SettingOutlined,
  CodeOutlined,
  RobotOutlined,
} from "@ant-design/icons";
import ComponentFields from "./components/rightPanel/ComponentFields";
import GlobalFields from "./components/rightPanel/GlobalFields";
import CodeSyncPanel from "./components/rightPanel/CodeSyncPanel";
import AIChatPanel from "./components/rightPanel/AIChatPanel";
import { useStoreComponents, useStorePage } from "@/shared/hooks";

export default function EditorRightPanel() {
  const { store: storePage } = useStorePage();
  const { store: storeComps } = useStoreComponents();

  const items = [
    {
      key: "components-fields",
      label: (
        <>
          <AppstoreOutlined />
          <span>组件属性</span>
        </>
      ),
      // 组件属性
      children: <ComponentFields store={storeComps} />,
    },
    {
      key: "page-fields",
      label: (
        <>
          <SettingOutlined />
          <span>全局属性</span>
        </>
      ),
      // 全局组件属性
      children: <GlobalFields store={storePage} />,
    },
    {
      key: "code-sync",
      label: (
        <>
          <CodeOutlined />
          <span>源码同步</span>
        </>
      ),
      children: <CodeSyncPanel />,
    },
    {
      key: "ai-chat",
      label: (
        <>
          <RobotOutlined />
          <span>AI生成</span>
        </>
      ),
      children: <AIChatPanel />,
    },
  ];

  return <Tabs defaultActiveKey="components-fields" items={items} />;
}
