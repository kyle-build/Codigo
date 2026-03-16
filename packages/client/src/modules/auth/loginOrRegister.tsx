import { useState } from "react";
import { ConfigProvider, theme } from "antd";
import Register from "./components/register/Register";
import Login from "./components/login/Login";
import { ParticleBackground } from "./components/background/ParticleBackground";

export default function LoginOrRegister() {
  // 切换弹窗逻辑
  const [loginOrRegister, setLoginOrRegister] = useState(true);
  const changeState = () => {
    setLoginOrRegister(!loginOrRegister);
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#10b981", // emerald-500
          colorBgContainer: "rgba(255, 255, 255, 0.05)",
          colorBorder: "rgba(255, 255, 255, 0.1)",
          colorText: "#ffffff",
          colorTextSecondary: "#9ca3af", // gray-400
          borderRadius: 8,
        },
        components: {
          Input: {
            colorBgContainer: "rgba(255, 255, 255, 0.05)",
            activeBorderColor: "#10b981",
            hoverBorderColor: "#34d399",
          },
          Button: {
            primaryShadow: "0 4px 14px 0 rgba(16, 185, 129, 0.39)",
          },
        },
      }}
    >
      <div className="relative flex h-full min-h-screen items-center justify-center overflow-hidden bg-[#07090f] font-sans text-white">
        <ParticleBackground />

        {/* Background Gradient Orbs */}
        <div className="pointer-events-none absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[100px]" />

        <div className="relative z-10">
          {loginOrRegister ? (
            <Register changeState={changeState}></Register>
          ) : (
            <Login changeState={changeState}></Login>
          )}
        </div>

        {/* Footer */}
        <div className="absolute bottom-6 text-center text-xs text-gray-600 font-mono z-10">
          © 2024 Codigo System. All rights reserved.
        </div>
      </div>
    </ConfigProvider>
  );
}
