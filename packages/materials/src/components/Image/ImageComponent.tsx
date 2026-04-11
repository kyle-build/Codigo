import React, { useMemo } from "react";
import { getDefaultValueByConfig } from "..";
import { type IImageComponentProps, imageComponentDefaultConfig } from ".";

interface ImageRuntimeProps extends IImageComponentProps {
  runtimeHeight?: string | number;
}

/**
 * 渲染图片物料，并按点击配置支持外链打开或锚点滚动。
 */
export default function ImageComponent(_props: ImageRuntimeProps) {
  // 当配置属性发生变化，重置属性并且重新渲染
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(imageComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  const img = (
    <img
      src={props.url}
      alt={props.name}
      className="w-full"
      style={{
        height: props.runtimeHeight ? "100%" : `${props.height}px`,
        objectFit: props.fit,
      }}
    />
  );

  if (props.handleClicked === "open-url" && props.link) {
    if (props.link.startsWith("#")) {
      return (
        <button
          type="button"
          onClick={() => {
            const element = document.getElementById(props.link!.slice(1));
            element?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="w-full text-left"
        >
          {img}
        </button>
      );
    }
    return (
      <a href={props.link} target="_blank" rel="noreferrer">
        {img}
      </a>
    );
  }

  return img;
}
