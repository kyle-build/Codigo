import { useAuthMode } from "../hooks/useAuthMode";
import LoginForm from "./Login/LoginForm";
import RegisterForm from "./register/RegisterForm";

export default function AuthContainer() {
  const { mode, toggle } = useAuthMode();
  return mode === "login" ? (
    <LoginForm switchMode={toggle} />
  ) : (
    <RegisterForm switchMode={toggle} />
  );
}
