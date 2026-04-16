import { CheckOutlined, EditOutlined } from "@ant-design/icons";
import { Input, Space } from "antd";
import { useState } from "react";
import type { ChangeEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useEditorPage } from "@/modules/editor/hooks";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

export default function Left(props: { title: string }) {
  const { setPageTitle } = useEditorPage();
  const [isEditState, setIsEditState] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isFlowWorkspace = location.pathname.startsWith("/flow");
  const displayTitle = isFlowWorkspace ? "流程编排" : props.title || "未命名页面";

  function handleEdit(event: ChangeEvent<HTMLInputElement>) {
    setPageTitle(event.target.value);
  }

  const publicProps = {
    className:
      "cursor-pointer text-[#858585] hover:text-[#cccccc] transition-colors",
    onClick: () => setIsEditState(!isEditState),
  };

  if (isEditState) {
    return (
      <Space size={8}>
        <Input
          value={props.title}
          onChange={handleEdit}
          size="small"
          className="w-52 !rounded-sm !border-[#3c3c3c] !bg-[#3c3c3c] !text-[13px] !text-[#cccccc] focus:!border-[#0e639c]"
        />
        <div
          className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#0e639c] text-white transition-all hover:bg-[#1177bb] cursor-pointer"
          onClick={() => setIsEditState(false)}
        >
          <CheckOutlined />
        </div>
      </Space>
    );
  } else {
    return (
      <div className="flex items-center gap-2">
        <button
          className="flex h-7 w-7 items-center justify-center rounded-sm bg-[#0e639c] text-white transition-all hover:bg-[#1177bb]"
          onClick={() => navigate("/")}
        >
          <span className="font-mono text-xs font-bold">
            C
          </span>
        </button>
        <WorkspaceSwitcher />
        <div className="min-w-0 ml-1">
          <div className="flex items-center gap-2">
            <h1 className="truncate text-xs font-medium tracking-tight text-[#cccccc]">
              {displayTitle}
            </h1>
            {!isFlowWorkspace && <EditOutlined {...publicProps} />}
          </div>
        </div>
      </div>
    );
  }
}
