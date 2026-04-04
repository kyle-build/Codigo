import { Breadcrumb } from "antd";
import React, { useMemo } from "react";
import { getDefaultValueByConfig } from "..";
import {
  type IBreadcrumbBarComponentProps,
  breadcrumbBarComponentDefaultConfig,
} from ".";

/**
 * 渲染页面顶部的面包屑导航物料，用于展示当前层级路径。
 */
export default function BreadcrumbBarComponent(
  _props: IBreadcrumbBarComponentProps,
) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(breadcrumbBarComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  return (
    <div
      style={{
        borderRadius: 16,
        background: "#ffffff",
        padding: "14px 18px",
        border: "1px solid #e5e7eb",
      }}
    >
      <Breadcrumb
        separator={props.separator}
        items={props.items.map((item) => ({
          key: item.id,
          title: item.label,
        }))}
      />
    </div>
  );
}
