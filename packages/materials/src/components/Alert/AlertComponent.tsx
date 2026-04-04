import React, { useMemo } from "react";
import { Alert } from "antd";
import { getDefaultValueByConfig } from "..";
import type { IAlertComponentProps } from ".";
import { alertComponentDefaultConfig } from ".";

/**
 * 渲染提示信息物料，统一封装图标、关闭按钮与提示类型配置。
 */
export default function AlertComponent(_props: IAlertComponentProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(alertComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  return (
    <Alert
      type={props.type}
      showIcon={props.showIcon}
      closable={props.showClose}
    />
  );
}
