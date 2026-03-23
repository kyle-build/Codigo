import { CaretLeftOutlined } from "@ant-design/icons";
import { FloatButton, QRCode } from "antd";
import { useLocation, useNavigate } from "react-router-dom";

export default function Release() {
  const nav = useNavigate();
  const location = useLocation();
  // to-do url替换
  const url = `http://example/${location.search.replace(
    "?id=",
    ""
  )}?forceUpdate=1`;

  return (
    <div className="w-screen h-screen flex overflow-hidden bg-slate-50">
      <div className="flex-[1]" />
      {/* 渲染的 nextjs 的发布页面 */}
      <div className="flex-[2] flex items-center justify-center">
        <div className="w-[380px] h-[700px]  bg-white text-left overflow-y-auto overflow-x-hidden shadow-2xl rounded-[30px] border-[8px] border-slate-800">
          <embed type="text/x-scriptlet" src={url} width="100%" height="100%" />
        </div>
      </div>
      <div className="flex-[1] flex items-center">
        <div className="flex flex-col items-center">
          {/* 二维码 */}
          <QRCode value={url} />
          <span>扫码此二维码在手机上预览</span>
          {/* 返回按钮 */}
          <FloatButton icon={<CaretLeftOutlined />} onClick={() => nav(-1)} />
        </div>
      </div>
    </div>
  );
}












