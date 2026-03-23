import React, { useMemo } from "react";
import { getDefaultValueByConfig } from "..";
import {
  type IRichTextComponentProps,
  richTextComponentDefaultConfig,
} from ".";

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
        请在富文本输入内�?      </div>
    );

  return <div dangerouslySetInnerHTML={{ __html: props.content }} />;
}
