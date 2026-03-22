import type { FC } from "react";
import { observer } from "mobx-react-lite";
import { toJS } from "mobx";
import { getComponentPropsByType } from "@/modules/editor/components/LowCodeComponents";
import type { TStoreComponents } from "@/shared/stores";
import { useStoreComponents } from "@/shared/hooks";
import { Form, InputNumber, Collapse, Divider } from "antd";

const { Panel } = Collapse;

const ComponentFields: FC<{ store: TStoreComponents }> = observer(
  ({ store }) => {
    // 为选中组件展示
    if (!store.currentCompConfig)
      return (
        <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
          未选中组件
        </div>
      );

    const { getCurrentComponentConfig, updateCurrentComponentStyles } =
      useStoreComponents();
    const config = getCurrentComponentConfig.get();

    if (!config) return null;

    // 右侧的配置属性组件
    const ComponentProps = getComponentPropsByType(config.type);

    // 当前样式
    const styles = config.styles || {};

    const handleStyleChange = (changedValues: any, allValues: any) => {
      // 转换值为带px单位的字符串，或者保留百分比/auto等
      const formattedStyles = { ...allValues };
      Object.keys(formattedStyles).forEach((key) => {
        if (typeof formattedStyles[key] === "number") {
          formattedStyles[key] = `${formattedStyles[key]}px`;
        }
      });
      updateCurrentComponentStyles(formattedStyles);
    };

    // 解析初始值 (去掉px以便在InputNumber中显示)
    const initialValues = { ...styles };
    Object.keys(initialValues).forEach((key) => {
      if (
        typeof initialValues[key] === "string" &&
        initialValues[key].endsWith("px")
      ) {
        initialValues[key] = parseFloat(initialValues[key]);
      }
    });

    return (
      <div className="component-fields-container pb-10">
        <Collapse
          defaultActiveKey={["props", "styles"]}
          ghost
          expandIconPosition="end"
        >
          <Panel
            header={<span className="font-bold">组件属性</span>}
            key="props"
          >
            {/* 移除 key 强制重新挂载，避免 FormContainer 内部重新初始化导致状态丢失 */}
            <ComponentProps {...toJS(config.props)} id={config.id} />
          </Panel>

          <Panel
            header={<span className="font-bold">组件尺寸与间距</span>}
            key="styles"
          >
            <Form
              layout="vertical"
              initialValues={initialValues}
              onValuesChange={handleStyleChange}
            >
              <Divider className="my-2" plain>
                位置 (Position)
              </Divider>
              <div className="grid grid-cols-2 gap-2">
                <Form.Item label="X 坐标" name="left">
                  <InputNumber className="w-full" placeholder="px" />
                </Form.Item>
                <Form.Item label="Y 坐标" name="top">
                  <InputNumber className="w-full" placeholder="px" />
                </Form.Item>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Form.Item label="宽度" name="width">
                  <InputNumber className="w-full" placeholder="默认 100%" />
                </Form.Item>
                <Form.Item label="高度" name="height">
                  <InputNumber className="w-full" placeholder="默认 auto" />
                </Form.Item>
              </div>

              <Divider className="my-2" plain>
                外间距 (Margin)
              </Divider>
              <div className="grid grid-cols-2 gap-2">
                <Form.Item label="上间距" name="marginTop">
                  <InputNumber className="w-full" placeholder="px" />
                </Form.Item>
                <Form.Item label="下间距" name="marginBottom">
                  <InputNumber className="w-full" placeholder="px" />
                </Form.Item>
                <Form.Item label="左间距" name="marginLeft">
                  <InputNumber className="w-full" placeholder="px" />
                </Form.Item>
                <Form.Item label="右间距" name="marginRight">
                  <InputNumber className="w-full" placeholder="px" />
                </Form.Item>
              </div>

              <Divider className="my-2" plain>
                内间距 (Padding)
              </Divider>
              <div className="grid grid-cols-2 gap-2">
                <Form.Item label="上间距" name="paddingTop">
                  <InputNumber className="w-full" placeholder="px" />
                </Form.Item>
                <Form.Item label="下间距" name="paddingBottom">
                  <InputNumber className="w-full" placeholder="px" />
                </Form.Item>
                <Form.Item label="左间距" name="paddingLeft">
                  <InputNumber className="w-full" placeholder="px" />
                </Form.Item>
                <Form.Item label="右间距" name="paddingRight">
                  <InputNumber className="w-full" placeholder="px" />
                </Form.Item>
              </div>
            </Form>
          </Panel>
        </Collapse>
      </div>
    );
  }
);

export default ComponentFields;
