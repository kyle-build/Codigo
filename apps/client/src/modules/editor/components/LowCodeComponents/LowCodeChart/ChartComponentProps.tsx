import { useMemo } from "react";
import { Input } from "antd";
import {
  type TBarChartComponentConfig,
  type TLineChartComponentConfig,
  type TPieChartComponentConfig,
  chartComponentDefaultConfig,
  fillComponentPropsByConfig,
} from "@codigo/materials";
import { FormContainer, FormPropLabel } from "..";

type ChartPropsUnion =
  | TBarChartComponentConfig["props"]
  | TLineChartComponentConfig["props"]
  | TPieChartComponentConfig["props"];

export default function ChartComponentProps(_props: ChartPropsUnion) {
  const props = useMemo(() => {
    return fillComponentPropsByConfig(
      _props as any,
      chartComponentDefaultConfig,
    );
  }, [_props]);

  return (
    <FormContainer config={props}>
      <FormPropLabel name="title" prop={props.title} label="图表标题：">
        <Input />
      </FormPropLabel>
      <FormPropLabel name="color" prop={props.color} label="主题颜色：">
        <Input type="color" />
      </FormPropLabel>
      <FormPropLabel
        name="xAxisKey"
        prop={props.xAxisKey}
        label="类目字段名（bar/line）："
      >
        <Input />
      </FormPropLabel>
      <FormPropLabel
        name="yAxisKey"
        prop={props.yAxisKey}
        label="数值字段名（bar/line）："
      >
        <Input />
      </FormPropLabel>
      <FormPropLabel
        name="nameKey"
        prop={props.nameKey}
        label="名称字段名（pie）："
      >
        <Input />
      </FormPropLabel>
      <FormPropLabel
        name="valueKey"
        prop={props.valueKey}
        label="数值字段名（pie）："
      >
        <Input />
      </FormPropLabel>
      <FormPropLabel name="dataText" prop={props.dataText} label="数据 JSON：">
        <Input.TextArea
          autoSize={{ minRows: 6, maxRows: 12 }}
          className="font-mono text-xs"
        />
      </FormPropLabel>
      <FormPropLabel
        name="optionText"
        prop={props.optionText}
        label="ECharts option JSON（高级）："
      >
        <Input.TextArea
          placeholder='例如：{"tooltip":{"formatter":"{b}: {c}"}}'
          autoSize={{ minRows: 8, maxRows: 16 }}
          className="font-mono text-xs"
        />
      </FormPropLabel>
    </FormContainer>
  );
}
