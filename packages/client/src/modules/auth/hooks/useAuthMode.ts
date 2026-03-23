import { useState } from "react";
type loginOrRegister = "login" | "register";

export function useAuthMode() {
  const [mode, setMode] = useState<loginOrRegister>("login");
  const toggle = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
  };

  return {
    mode,
    toggle,
  };
}












