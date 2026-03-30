import { Input, InputNumber } from "antd";
import { useMemo } from "react";
import {
  fillComponentPropsByConfig,
  twoColumnComponentDefaultConfig,
  type ITwoColumnComponentProps,
} from "@codigo/materials";
import { FormContainer, FormPropLabel } from "..";

export default function TwoColumnComponentProps(
  _props: ITwoColumnComponentProps,
) {
  const props = useMemo(() => {
    return fillComponentPropsByConfig(_props, twoColumnComponentDefaultConfig);
  }, [_props]);

  return (
    <FormContainer layout="vertical" config={props}>
      <FormPropLabel name="title" prop={props.title} label="布局标题：">
        <Input />
      </FormPropLabel>
      <FormPropLabel name="leftWidth" prop={props.leftWidth} label="左栏宽度：">
        <InputNumber className="w-full" />
      </FormPropLabel>
      <FormPropLabel name="gap" prop={props.gap} label="栏间距：">
        <InputNumber className="w-full" />
      </FormPropLabel>
      <FormPropLabel name="minHeight" prop={props.minHeight} label="最小高度：">
        <InputNumber className="w-full" />
      </FormPropLabel>
      <FormPropLabel
        name="backgroundColor"
        prop={props.backgroundColor}
        label="背景色："
      >
        <Input />
      </FormPropLabel>
    </FormContainer>
  );
}
