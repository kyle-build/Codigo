import { Button, message } from "antd";
import { FormOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useRequest } from "ahooks";
import type { TBasicComponentConfig as IComponent } from "@codigo/materials";
import ComponentDatas from "./components/ComponentDatas";
import { getQuestionComponents } from "@/modules/editor/api/low-code";
import DataSource from "./components/DataSource";
import ComponentSelect from "./components/ComponentSelect";

export default function Statistics() {
  const nav = useNavigate();
  const [disable, setDisable] = useState(false);
  const [components, setComponents] = useState<IComponent[]>([]);
  const [currentSelected, setCurrentSelected] = useState<IComponent>();

  // 将当前主要内容部分置灰
  function handleDisable() {
    setDisable(true);
  }

  // 获取所有问卷组件
  useRequest(getQuestionComponents, {
    onSuccess: ({ data }) => {
      if (data.length === 0) {
        setDisable(true);
        message.warning("请先创建至少一个表单组件");
        return;
      }
      setComponents(data);
      setCurrentSelected(data[0]);
    },
  });

  return (
    <div className="flex h-full flex-col p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[12px] text-[var(--ide-text-muted)]">
            表单组件数据统计
          </div>
          <h2 className="mt-0.5 truncate text-[14px] font-semibold text-[var(--ide-text)]">
            指标统计
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button type="primary" onClick={() => nav("/editor")} icon={<FormOutlined />}>
            进入编辑器
          </Button>
        </div>
      </div>

      <div
        className={[
          "flex min-h-0 flex-1 gap-3 overflow-hidden",
          disable ? "opacity-50 select-none pointer-events-none" : "",
        ].join(" ")}
      >
        <div className="min-w-0 flex-1 overflow-hidden rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] shadow-[var(--ide-panel-shadow)]">
          <div className="h-full overflow-hidden flex flex-col">
            <ComponentDatas components={components} handleDisable={handleDisable} />
          </div>
        </div>
        <div className="w-[320px] flex-none overflow-hidden">
          <div className="flex h-full flex-col gap-3 overflow-hidden">
            <div className="rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-3 shadow-[var(--ide-panel-shadow)]">
              <h3 className="text-[12px] font-semibold text-[var(--ide-text)]">
                组件列表
              </h3>
              <div className="mt-2">
                <ComponentSelect
                  components={components}
                  setCurrnetSelected={setCurrentSelected}
                  currentSelected={Number(currentSelected?.id ?? 0)}
                />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-hidden rounded-sm border border-[var(--ide-border)] bg-[var(--ide-control-bg)] p-3 shadow-[var(--ide-panel-shadow)]">
              <h3 className="text-[12px] font-semibold text-[var(--ide-text)]">
                数据详情
              </h3>
              <div className="mt-2 h-[calc(100%-20px)] overflow-auto">
                <div className="w-full text-center">
                  <DataSource currentSelected={currentSelected} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
