import { Form, Input, Switch } from "antd";
import { useMemo } from "react";
import {
  accordionComponentDefaultConfig,
  accordionItemDefaultValue,
  fillComponentPropsByConfig,
  type IAccordionComponentProps,
} from "@codigo/materials";
import { FormContainer, FormContainerWithList, FormPropLabel } from "..";

const { TextArea } = Input;

export default function AccordionComponentProps(
  _props: IAccordionComponentProps,
) {
  const props = useMemo(() => {
    return fillComponentPropsByConfig(_props, accordionComponentDefaultConfig);
  }, [_props]);

  return (
    <>
      <FormContainer config={props} layout="vertical">
        <FormPropLabel
          prop={props.accordion}
          name="accordion"
          label="仅允许展开一个面板："
          valuePropName="checked"
        >
          <Switch />
        </FormPropLabel>

        <FormPropLabel
          prop={props.ghost}
          name="ghost"
          label="使用简洁样式："
          valuePropName="checked"
        >
          <Switch />
        </FormPropLabel>
      </FormContainer>

      <FormContainerWithList
        id={props.id.value}
        items={props.items.value}
        newItemDefaultValue={accordionItemDefaultValue}
      >
        <Form.Item label="标题：" name="title">
          <Input />
        </Form.Item>
        <Form.Item label="内容：" name="content">
          <TextArea rows={4} />
        </Form.Item>
      </FormContainerWithList>
    </>
  );
}
