import { Table, Typography } from "antd";
import React, { useMemo } from "react";
import { getDefaultValueByConfig } from "..";
import { type IDataTableComponentProps, dataTableComponentDefaultConfig } from ".";

const { Title } = Typography;

interface DataTableRuntimeProps extends IDataTableComponentProps {
  runtimeHeight?: string | number;
}

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
export default function DataTableComponent(_props: DataTableRuntimeProps) {
  const props = useMemo(() => {
    return {
      ...getDefaultValueByConfig(dataTableComponentDefaultConfig),
      ..._props,
    };
  }, [_props]);
  const hasRuntimeHeight =
    props.runtimeHeight !== undefined &&
    props.runtimeHeight !== null &&
    props.runtimeHeight !== "auto";

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
        height: hasRuntimeHeight ? "100%" : undefined,
        minHeight: hasRuntimeHeight ? 0 : undefined,
        display: hasRuntimeHeight ? "flex" : undefined,
        flexDirection: hasRuntimeHeight ? "column" : undefined,
        borderRadius: 28,
        background: "#ffffff",
        padding: 24,
        border: "1px solid #eef1f6",
        boxShadow: "0 24px 60px rgba(15, 23, 42, 0.06)",
      }}
    >
      <Title level={4} style={{ marginTop: 0, marginBottom: 18 }}>
        {props.title}
      </Title>
      <div
        style={{
          flex: hasRuntimeHeight ? "1 1 auto" : undefined,
          minHeight: hasRuntimeHeight ? 0 : undefined,
          overflow: hasRuntimeHeight ? "auto" : undefined,
        }}
      >
        <Table
          columns={columns}
          dataSource={dataSource}
          size={props.size}
          bordered={props.bordered}
          rowClassName={(_, index) =>
            index % 2 === 0 ? "bg-white" : "bg-[#fafbff]"
          }
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
    </div>
  );
}
