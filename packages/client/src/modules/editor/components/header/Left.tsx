import { CheckOutlined, EditOutlined } from "@ant-design/icons";
import { Input, Space, Menu, Dropdown } from "antd";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import { useStorePage } from "@/shared/hooks/useStorePage";

export default function Left(props: { title: string }) {
  const { setPageTitle } = useStorePage();
  const [isEditState, setIsEditState] = useState(false);
  const navigate = useNavigate();

  // 确认按钮方法
  function handleEdit(event: ChangeEvent<HTMLInputElement>) {
    setPageTitle(event.target.value);
  }

  // 标题的样式和按钮点击方法
  const publicProps = {
    className:
      "cursor-pointer ml-2 text-slate-400 hover:text-emerald-500 transition-colors",
    onClick: () => setIsEditState(!isEditState),
  };

  const menu = (
    <Menu
      onClick={({ key }) => {
        if (key === 'page') navigate('/editor');
        if (key === 'flow') navigate('/flow');
        if (key === 'report') navigate('/report');
      }}
      items={[
        { label: '页面搭建', key: 'page' },
        { label: '流程设计', key: 'flow' },
        { label: '报表设计', key: 'report' },
      ]}
    />
  );

  // 判断是否展示编辑还是显示状态
  if (isEditState) {
    return (
      <Space>
        <Input
          value={props.title}
          onChange={handleEdit}
          className="w-48 !bg-white/5 !border-slate-200 !text-slate-900 focus:!border-emerald-500"
        />
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all cursor-pointer"
          onClick={() => setIsEditState(false)}
        >
          <CheckOutlined />
        </div>
      </Space>
    );
  } else {
    return (
      <div className="flex items-center group gap-4">
        <Dropdown overlay={menu} trigger={['click']}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] cursor-pointer hover:shadow-emerald-500/20 transition-all">
            <span className="font-mono text-lg font-bold">C</span>
          </div>
        </Dropdown>
        <div className="flex items-center">
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            {props.title}
          </h1>
          <EditOutlined {...publicProps} />
        </div>
      </div>
    );
  }
}












