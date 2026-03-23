import { Button, message } from "antd";
import { FormOutlined, LineChartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useRequest } from "ahooks";
import type { TBasicComponentConfig as IComponent } from "@codigo/materials-react";
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
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      <header className="flex items-center border-b border-slate-200 px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => nav("/")}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-500 text-white font-mono text-lg font-bold shadow-lg shadow-emerald-500/30">
            C
          </div>
          <span className="text-lg font-bold text-slate-900 tracking-tight">
            数据统计看板
          </span>
        </div>
        <div className="flex-1 flex justify-end items-center gap-4">
          <Button
            type="primary"
            className="bg-emerald-500 hover:bg-emerald-600 flex items-center"
            onClick={() => nav("/editor")}
            icon={<FormOutlined />}
          >
            进入编辑器
          </Button>
          <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold border border-emerald-200">
            A
          </div>
        </div>
      </header>

      <div
        className={`${
          disable && "opacity-50 select-none pointer-events-none"
        } flex flex-1 p-6 gap-6 overflow-hidden`}
      >
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-grow overflow-hidden flex flex-col">
          <ComponentDatas
            components={components}
            handleDisable={handleDisable}
          />
        </div>
        <div className="w-80 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-900 mb-4">组件列表</h3>
            <ComponentSelect
              components={components}
              setCurrnetSelected={setCurrentSelected}
              currentSelected={currentSelected?.id ?? 0}
            />
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex-1">
            <h3 className="text-sm font-bold text-slate-900 mb-4">数据详情</h3>
            <div className="w-full text-center">
              <DataSource currentSelected={currentSelected} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}












