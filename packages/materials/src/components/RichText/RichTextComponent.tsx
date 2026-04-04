import React, { useMemo } from "react";
import { getDefaultValueByConfig } from "..";
import {
  type IRichTextComponentProps,
  richTextComponentDefaultConfig,
} from ".";

/**
 * 渲染富文本物料，内容为空时展示占位提示。
 */
export default function RichTextComponent(_props: IRichTextComponentProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(richTextComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  if (!props.content)
    return (
      <div id="placeholder" className="w-full h-20">
        请在富文本输入内输入内容
      </div>
    );

  return <div dangerouslySetInnerHTML={{ __html: props.content }} />;
}
