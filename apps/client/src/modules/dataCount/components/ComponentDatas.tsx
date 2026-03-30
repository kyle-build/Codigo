import type { ColumnsType } from "antd/es/table";
import { Button, Space, Table, message } from "antd";
import { useRequest } from "ahooks";
import type { TBasicComponentConfig as IComponent } from "@codigo/materials";
import { useMemo, useState } from "react";
import { getQuestionData } from "@/modules/editor/api/low-code";
import { useStorePage } from "@/shared/hooks/useStorePage";
import { excelToZip, jsonToExcel } from "@/shared/utils/excel";

export default function ComponentDatas(props: {
  components: IComponent[];
  handleDisable: () => void;
}) {
  const [dataSource, setDataSource] = useState<any[]>([]);

  // 处理成 table 组件需要的数据格式
  const columns: ColumnsType<any> = useMemo(() => {
    return props.components.map((item) => {
      return {
        key: item.id,
        dataIndex: item.id,
        title: item.options?.title ?? item.type ?? "默认展示的标题",
      };
    });
  }, [props.components]);

  const { loading } = useRequest(getQuestionData, {
    onSuccess: ({ data }) => {
      if (data.length === 0) {
        props.handleDisable();
        message.warning("还未有用户提交数据哦");
        return;
      }

      const result = data.map((res: any) => {
        return res
          .map((item: any) => {
            let value: any = item.result?.value;
            // 如果是radio或checkbox类型
            if (["radio", "checkbox"].includes(item.type)) {
              // 如果value为空，则使用第一个选项的value
              if (!value) {
                value = !item.options?.length
                  ? "选项1"
                  : item.options![0].value;
              } else {
                // 如果value是数组，则将其转换为逗号分隔的字符串
                if (Array.isArray(value))
                  value = value
                    .map(
                      (v) =>
                        item.options!.find((option: any) => option.id === v)
                          ?.value,
                    )
                    .join(",");
                // 如果value是数字，则将其转换为对应选项的value
                else
                  value = item.options!.find(
                    (option: any) => option.id === value,
                  )?.value;
              }
            }

            return {
              value,
              key: item.result.id,
            };
          })
          .reduce((pre: any, cur: any) => {
            return {
              key: cur.key,
              [cur.key]: cur.value,
              ...pre,
            };
          }, {});
      });
      setDataSource(result);
    },
  });

  const { store } = useStorePage();

  async function handleExportExcel(isWriteFile?: boolean) {
    return jsonToExcel({
      columns,
      dataSource,
      title: store.title,
      isWriteFile: isWriteFile ?? true,
    });
  }

  async function handleExportZip() {
    const excel = await jsonToExcel({
      columns,
      dataSource,
      title: store.title,
      isWriteFile: false,
    });

    excelToZip(excel);
  }

  return (
    <div className="relative">
      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
      ></Table>
      <div className="absolute z-10 right-2 bottom-[-40px]">
        <Space>
          <Button onClick={handleExportZip}>导出压缩包</Button>
          <Button type="primary" onClick={() => handleExportExcel()}>
            导出Excel
          </Button>
        </Space>
      </div>
    </div>
  );
}
