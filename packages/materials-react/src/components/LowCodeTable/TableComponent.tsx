import React, { useMemo } from "react";
import { Card, Table } from "antd";
import { getDefaultValueByConfig } from "..";
import { type ITableComponentProps, tableComponentDefaultConfig } from ".";

type TableColumn = {
  title: string;
  dataIndex: string;
};

function parseJsonText<T>(text: string, fallback: T): T {
  try {
    const parsed = JSON.parse(text) as T;
    return parsed;
  } catch {
    return fallback;
  }
}

export default function TableComponent(_props: ITableComponentProps) {
  const props = useMemo(() => {
    return { ...getDefaultValueByConfig(tableComponentDefaultConfig), ..._props };
  }, [_props]);

  const columns = useMemo(() => {
    const fallback = parseJsonText<TableColumn[]>(
      tableComponentDefaultConfig.columnsText.defaultValue,
      [],
    );
    return parseJsonText<TableColumn[]>(props.columnsText, fallback);
  }, [props.columnsText]);

  const dataSource = useMemo(() => {
    const fallback = parseJsonText<Record<string, unknown>[]>(
      tableComponentDefaultConfig.dataText.defaultValue,
      [],
    );
    return parseJsonText<Record<string, unknown>[]>(props.dataText, fallback);
  }, [props.dataText]);

  return (
    <Card title={props.title} size="small">
      <Table
        size={props.size}
        bordered={props.bordered}
        columns={columns}
        dataSource={dataSource}
        pagination={props.pagination ? { pageSize: props.pageSize } : false}
      />
    </Card>
  );
}
