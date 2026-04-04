import { Input, InputNumber, Segmented, Select } from "antd";
import type { SegmentedLabeledOption } from "antd/es/segmented";
import { useMemo } from "react";
import {
  type IAvatarComponentProps,
  avatarComponentDefaultConfig,
  fillComponentPropsByConfig,
} from "@codigo/materials";
import { FormContainer, FormPropLabel, UploadEditOrChooiseInput } from "..";

const clickOptions: SegmentedLabeledOption[] = [
  { value: "none", label: "无" },
  { value: "open-url", label: "跳转链接" },
];

const shapeOptions = [
  { value: "circle", label: "圆形" },
  { value: "square", label: "方形" },
];

export default function AvatarComponentProps(_props: IAvatarComponentProps) {
  const props = useMemo(() => {
    return fillComponentPropsByConfig(_props, avatarComponentDefaultConfig);
  }, [_props]);

  return (
    <FormContainer layout="vertical" config={props}>
      <FormPropLabel name="name" prop={props.name} label="头像名称：">
        <Input />
      </FormPropLabel>
      <FormPropLabel name="size" prop={props.size} label="头像尺寸：">
        <InputNumber className="w-full" min={24} max={160} />
      </FormPropLabel>
      <FormPropLabel name="shape" prop={props.shape} label="头像形状：">
        <Select options={shapeOptions} />
      </FormPropLabel>
      <FormPropLabel
        name="handleClicked"
        prop={props.handleClicked}
        label="点击行为："
      >
        <Segmented options={clickOptions} />
      </FormPropLabel>
      <FormPropLabel name="link" prop={props.link} label="跳转地址：">
        <Input placeholder="https://example.com 或 #section-id" />
      </FormPropLabel>
      <FormPropLabel name="url" prop={props.url} label="头像地址：">
        <UploadEditOrChooiseInput type="image" propName="url" />
      </FormPropLabel>
    </FormContainer>
  );
}
