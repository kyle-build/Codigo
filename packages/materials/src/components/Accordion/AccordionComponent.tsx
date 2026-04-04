import { Collapse } from "antd";
import { useMemo } from "react";
import { getDefaultValueByConfig } from "..";
import {
  accordionComponentDefaultConfig,
  type IAccordionComponentProps,
} from ".";

/**
 * 渲染手风琴物料，支持单项展开与简洁边框模式。
 */
export default function AccordionComponent(_props: IAccordionComponentProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(accordionComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  const items = useMemo(() => {
    return props.items.map((item) => ({
      key: item.id || item.title,
      label: item.title,
      children: (
        <div className="whitespace-pre-wrap break-words">{item.content}</div>
      ),
    }));
  }, [props.items]);

  return <Collapse accordion={props.accordion} ghost={props.ghost} items={items} />;
}
