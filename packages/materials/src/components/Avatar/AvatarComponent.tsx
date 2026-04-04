import React, { useMemo } from "react";
import { getDefaultValueByConfig } from "../func";
import { Avatar } from "antd";
import {
  type IAvatarComponentProps,
  avatarComponentDefaultConfig,
} from "./type";

/**
 * 渲染头像物料，并按点击配置支持外链打开或锚点滚动。
 */
export default function AvatarComponent(_props: IAvatarComponentProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(avatarComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  const fallbackText = props.name.trim().slice(0, 1) || "头";
  const avatar = (
    <Avatar
      src={props.url || undefined}
      size={props.size}
      shape={props.shape}
      alt={props.name}
    >
      {fallbackText}
    </Avatar>
  );

  if (props.handleClicked === "open-url" && props.link) {
    if (props.link.startsWith("#")) {
      return (
        <button
          type="button"
          onClick={() => {
            const element = document.getElementById(props.link.slice(1));
            element?.scrollIntoView({ behavior: "smooth", block: "start" });
          }}
          className="inline-flex cursor-pointer items-center border-0 bg-transparent p-0 text-left"
          aria-label={props.name}
        >
          {avatar}
        </button>
      );
    }

    return (
      <a
        href={props.link}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center"
        aria-label={props.name}
      >
        {avatar}
      </a>
    );
  }

  return avatar;
}

