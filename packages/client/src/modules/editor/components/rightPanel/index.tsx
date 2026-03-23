import { useState } from "react";
import { Button, Tabs } from "antd";
import {
  AppstoreOutlined,
  SettingOutlined,
  CodeOutlined,
  RobotOutlined,
  TeamOutlined,
  LineChartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import ComponentFields from "./ComponentFields";
import GlobalFields from "./GlobalFields";
import CodeSyncPanel from "./CodeSyncPanel";
import AIChatPanel from "./AIChatPanel";
import PermissionPanel from "./PermissionPanel";
import { useStoreComponents, useStorePage } from "@/shared/hooks";

export default function EditorRightPanel() {
  const navigate = useNavigate();
  const { store: storePage } = useStorePage();
  const { store: storeComps } = useStoreComponents();
  const [activeKey, setActiveKey] = useState("components-fields");

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
    {
      key: "permission",
      label: (
        <>
          <TeamOutlined />
          <span>协作权限</span>
        </>
      ),
      children: <PermissionPanel />,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Button
          icon={<RobotOutlined />}
          onClick={() => setActiveKey("ai-chat")}
          className="flex items-center justify-center"
        >
          AI编辑
        </Button>
        <Button
          icon={<LineChartOutlined />}
          onClick={() => navigate("/dataCount")}
          className="flex items-center justify-center"
        >
          后台数据
        </Button>
      </div>
      <Tabs activeKey={activeKey} onChange={setActiveKey} items={items} />
    </div>
  );
}












