import { Table, Typography } from "antd";
import React, { useMemo } from "react";
import { getDefaultValueByConfig } from "..";
import { type IDataTableComponentProps, dataTableComponentDefaultConfig } from ".";

const { Title } = Typography;

/**
 * 安全解析表格配置中的 JSON 字符串，解析失败时返回兜底数组。
 */
function safeParse(value: string, fallback: unknown[]) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

/**
 * 渲染数据表格物料，并将字符串化的列配置与数据源转换为 Ant Design Table 可用结构。
 */
export default function DataTableComponent(_props: IDataTableComponentProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(dataTableComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);

  const columns = safeParse(
    props.columnsText,
    JSON.parse(dataTableComponentDefaultConfig.columnsText.defaultValue),
  );
  const dataSource = safeParse(
    props.dataText,
    JSON.parse(dataTableComponentDefaultConfig.dataText.defaultValue),
  );

  return (
    <div
      style={{
        borderRadius: 20,
        background: "#ffffff",
        padding: 24,
        border: "1px solid #e5e7eb",
      }}
    >
      <Title level={4} style={{ marginTop: 0 }}>
        {props.title}
      </Title>
      <Table
        columns={columns}
        dataSource={dataSource}
        size={props.size}
        bordered={props.bordered}
        pagination={
          props.pagination
            ? {
                pageSize: props.pageSize,
              }
            : false
        }
        locale={{ emptyText: props.emptyText }}
      />
    </div>
  );
}
