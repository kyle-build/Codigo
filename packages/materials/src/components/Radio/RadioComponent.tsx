import React, { useMemo } from "react";
import { Radio } from "antd";
import { getDefaultValueByConfig } from "..";
import { type IRadioComponentProps, radioComponentDefaultConfig } from ".";

/**
 * 渲染单选框物料，并将配置选项映射为可选项列表。
 */
export default function RadioComponent(_props: IRadioComponentProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(radioComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  return (
    <div className="space-y-2 p-4">
      <span className="text-lg font-bold">{props.title}:</span>
      <br />
      <Radio.Group
        value={props.defaultRadio}
        onChange={(event) => props.onUpdate?.(event.target.value)}
      >
        {props.options.map((item) => (
          <Radio value={item.id} key={item.id}>
            {item.value}
          </Radio>
        ))}
      </Radio.Group>
    </div>
  );
}
