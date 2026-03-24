import { useMemo } from "react";
import { Input, InputNumber, Segmented } from "antd";
import type { SegmentedLabeledOption } from "antd/es/segmented";
import {
  type IStatisticComponentProps,
  fillComponentPropsByConfig,
  statisticComponentDefaultConfig,
} from "@codigo/materials-react";
import { FormContainer, FormPropLabel } from "..";

export default function StatisticComponentProps(
  _props: IStatisticComponentProps,
) {
  const props = useMemo(() => {
    return fillComponentPropsByConfig(_props, statisticComponentDefaultConfig);
  }, [_props]);

  const trendOptions: SegmentedLabeledOption[] = [
    { value: "up", label: "上升" },
    { value: "down", label: "下降" },
    { value: "none", label: "无趋势" },
  ];

  return (
    <FormContainer config={props}>
      <FormPropLabel name="title" prop={props.title} label="标题：">
        <Input />
      </FormPropLabel>
      <FormPropLabel name="value" prop={props.value} label="数值：">
        <InputNumber className="w-full" />
      </FormPropLabel>
      <FormPropLabel name="precision" prop={props.precision} label="小数位：">
        <InputNumber className="w-full" min={0} max={6} />
      </FormPropLabel>
      <FormPropLabel name="prefix" prop={props.prefix} label="前缀：">
        <Input placeholder="￥" />
      </FormPropLabel>
      <FormPropLabel name="suffix" prop={props.suffix} label="后缀：">
        <Input placeholder="单 / %" />
      </FormPropLabel>
      <FormPropLabel name="trend" prop={props.trend} label="趋势：">
        <Segmented options={trendOptions} />
      </FormPropLabel>
      <FormPropLabel name="trendText" prop={props.trendText} label="趋势文案：">
        <Input />
      </FormPropLabel>
    </FormContainer>
  );
}
