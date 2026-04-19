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
        borderRadius: 999,
        background: "#ffffff",
        padding: "12px 18px",
        border: "1px solid #eef1f6",
        boxShadow: "0 18px 44px rgba(15, 23, 42, 0.05)",
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
