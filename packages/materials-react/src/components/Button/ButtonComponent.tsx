import React, { useMemo } from "react";
import { Button } from "antd";
import { getDefaultValueByConfig } from "..";
import {
  type IButtonComponentProps,
  buttonComponentDefaultConfig,
} from "./type";

export default function ButtonComponent(_props: IButtonComponentProps) {
  const props = useMemo(() => {
    return { ...getDefaultValueByConfig(buttonComponentDefaultConfig), ..._props };
  }, [_props]);

  function handleClick() {
    if (props.actionType === "open-url" && props.link) {
      if (props.link.startsWith("#")) {
        const element = document.getElementById(props.link.slice(1));
        element?.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
      window.open(props.link, "_blank", "noopener,noreferrer");
      return;
    }

    if (props.actionType === "scroll-to-id" && props.targetId) {
      const element = document.getElementById(props.targetId);
      element?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <Button
      type={props.type}
      size={props.size}
      danger={props.danger}
      block={props.block}
      onClick={handleClick}
    >
      {props.text}
    </Button>
  );
}
