import { Tabs } from "antd";
import { AppstoreOutlined } from "@ant-design/icons";
import ComponentList from "./componentsList";

export default function EditorLeftPanel() {
  const items = [
    {
      key: "component-list",
      label: (
        <>
          <AppstoreOutlined /> <span>组件列表</span>
        </>
      ),
      children: <ComponentList />,
    },
  ];

  return <Tabs defaultActiveKey="component-list" items={items} />;
}












