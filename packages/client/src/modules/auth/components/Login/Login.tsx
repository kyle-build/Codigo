import { useTitle } from "ahooks";
import { useState } from "react";
import Account from "./Account.tsx";
import Captcha from "./Captcha.tsx";
// import WechatLogin from "./login/WechatLogin";

interface ILoginProps {
  changeState: () => void;
}
export default function Login(props: ILoginProps) {
  useTitle("Codigo低代码平台 - 登录");
  const [activeKey, setActiveKey] = useState(1);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-[400px] rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-2xl backdrop-blur-xl transition-all hover:shadow-emerald-500/10">
        <div className="mb-8 space-y-4 px-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-lg shadow-emerald-500/20">
            <span className="font-mono text-xl font-bold">C</span>
          </div>
          <div className="flex justify-center space-x-6 text-sm font-medium">
            <span
              onClick={() => setActiveKey(1)}
              className={`cursor-pointer transition-colors ${
                activeKey
                  ? "text-emerald-600 border-b-2 border-emerald-500 pb-1 font-bold"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              密码登录
            </span>
            <span
              onClick={() => setActiveKey(0)}
              className={`cursor-pointer transition-colors ${
                !activeKey
                  ? "text-emerald-600 border-b-2 border-emerald-500 pb-1 font-bold"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              验证码登录
            </span>
          </div>
          <p className="text-xs text-slate-500">
            登录后方可体验Codigo低代码平台
          </p>
        </div>

        {/* 账号密码登录输入框 */}
        <div className="mb-6">
          {!!activeKey && <Account />}
          {!activeKey && <Captcha />}
        </div>

        <div className="mb-6 flex items-center space-x-2">
          <hr className="flex-grow border-slate-200" />
          <span className="text-xs text-slate-400" data-id="14">
            或者
          </span>
          <hr className="flex-grow border-slate-200" />
        </div>

        {/* <div className="flex justify-center">
          <WechatLogin />
        </div> */}

        <div className="mt-6 text-center text-sm text-slate-500">
          <span>
            还没账号？
            <span
              onClick={props.changeState}
              className="cursor-pointer text-emerald-600 transition-colors hover:text-emerald-500 hover:underline"
            >
              去注册
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}












