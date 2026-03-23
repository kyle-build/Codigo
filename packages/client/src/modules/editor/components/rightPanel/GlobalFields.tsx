import { Form, Input } from "antd";
import { observer } from "mobx-react-lite";
import type { FC } from "react";

import { useStorePage } from "@/shared/hooks";
import type { TStorePage } from "@/shared/stores";

const GlobalFields: FC<{ store: TStorePage }> = observer(({ store }) => {
  const { updatePage } = useStorePage();

  // 当输入框的值发生改变时同步更新 store 的变量
  function handleValuesChange(changedValues: Partial<TStorePage>) {
    updatePage(changedValues);
  }

  return (
    <Form
      layout="vertical"
      initialValues={store}
      onValuesChange={handleValuesChange}
    >
      <Form.Item label="页面标题:" name="title">
        <Input />
      </Form.Item>

      <Form.Item label="页面详情:" name="description">
        <Input />
      </Form.Item>

      <Form.Item label="页面关键字（以,分割):" name="tdk">
        <Input />
      </Form.Item>
    </Form>
  );
});

export default GlobalFields;












