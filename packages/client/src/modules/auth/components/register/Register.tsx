import { useTitle } from "ahooks";
import RegisterOption from "./RegisterOption";
// import WechatLogin from "./login/WechatLogin";

interface IRegisterProps {
  changeState: () => void; // 切换弹窗
}

export default function Register(props: IRegisterProps) {
  useTitle("Codigo低代码平台 - 注册");
  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-[400px] rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-2xl backdrop-blur-xl transition-all hover:shadow-emerald-500/10">
        <div className="mb-8 space-y-4 px-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-lg shadow-emerald-500/20">
            <span className="font-mono text-xl font-bold">C</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            快速注册
          </h2>
          <p className="text-xs text-slate-500">创建账号，开启您的低代码之旅</p>
        </div>

        {/* 注册输入框 */}
        <div className="mb-6">
          <RegisterOption />
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
            已有账号？
            <span
              onClick={props.changeState}
              className="cursor-pointer text-emerald-600 transition-colors hover:text-emerald-500 hover:underline"
            >
              去登录
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}












