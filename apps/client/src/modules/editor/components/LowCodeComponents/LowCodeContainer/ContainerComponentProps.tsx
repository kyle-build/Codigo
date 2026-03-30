import { Input, InputNumber } from "antd";
import { useMemo } from "react";
import {
  containerComponentDefaultConfig,
  fillComponentPropsByConfig,
  type IContainerComponentProps,
} from "@codigo/materials";
import { FormContainer, FormPropLabel } from "..";

export default function ContainerComponentProps(
  _props: IContainerComponentProps,
) {
  const props = useMemo(() => {
    return fillComponentPropsByConfig(_props, containerComponentDefaultConfig);
  }, [_props]);

  return (
    <FormContainer layout="vertical" config={props}>
      <FormPropLabel name="title" prop={props.title} label="容器标题：">
        <Input />
      </FormPropLabel>
      <FormPropLabel
        name="backgroundColor"
        prop={props.backgroundColor}
        label="背景色："
      >
        <Input />
      </FormPropLabel>
      <FormPropLabel
        name="borderColor"
        prop={props.borderColor}
        label="边框色："
      >
        <Input />
      </FormPropLabel>
      <FormPropLabel
        name="borderRadius"
        prop={props.borderRadius}
        label="圆角："
      >
        <InputNumber className="w-full" />
      </FormPropLabel>
      <FormPropLabel name="padding" prop={props.padding} label="内边距：">
        <InputNumber className="w-full" />
      </FormPropLabel>
      <FormPropLabel name="minHeight" prop={props.minHeight} label="最小高度：">
        <InputNumber className="w-full" />
      </FormPropLabel>
    </FormContainer>
  );
}
