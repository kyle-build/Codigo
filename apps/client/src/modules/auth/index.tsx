import { useState } from "react";
import { ConfigProvider } from "antd";
import Register from "./components/register/Register";
import Login from "./components/login/Login";

export default function LoginOrRegister({
  isModal = false,
}: {
  isModal?: boolean;
}) {
  const [showLogin, setShowLogin] = useState(true);
  const changeState = () => {
    setShowLogin(!showLogin);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#0f6cbd",
          colorBgContainer: "#ffffff",
          colorBorder: "#e5e7eb",
          colorText: "#1f2328",
          colorTextSecondary: "#57606a",
          borderRadius: 8,
        },
        components: {
          Input: {
            colorBgContainer: "#ffffff",
            activeBorderColor: "#0f6cbd",
            hoverBorderColor: "#2b7cd3",
          },
          Button: {
            primaryShadow: "0 6px 16px 0 rgba(15, 108, 189, 0.26)",
          },
        },
      }}
    >
      {isModal ? (
        <div className="p-4">
          <div className="relative z-10">
            {showLogin ? (
              <Login changeState={changeState} />
            ) : (
              <Register changeState={changeState} />
            )}
          </div>
        </div>
      ) : (
        <div className="relative flex h-full min-h-screen items-center justify-center overflow-hidden bg-[#f3f3f3] font-sans text-[#1f2328]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.55]"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(243,243,243,0.98) 100%), repeating-linear-gradient(90deg, rgba(31,35,40,0.06) 0px, rgba(31,35,40,0.06) 1px, transparent 1px, transparent 28px), repeating-linear-gradient(0deg, rgba(31,35,40,0.04) 0px, rgba(31,35,40,0.04) 1px, transparent 1px, transparent 28px)",
            }}
          />
          <div className="pointer-events-none absolute -top-24 -left-20 h-[420px] w-[420px] rounded-full bg-[#0f6cbd]/8 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-28 -right-24 h-[520px] w-[520px] rounded-full bg-[#007acc]/6 blur-[110px]" />

          <div className="relative z-10">
            {showLogin ? (
              <Login changeState={changeState} />
            ) : (
              <Register changeState={changeState} />
            )}
          </div>

          <div className="absolute bottom-6 z-10 text-center font-mono text-xs text-slate-500">
            © 2024 Codigo System. All rights reserved.
          </div>
        </div>
      )}
    </ConfigProvider>
  );
}
