import { Button as AntButton } from "antd";
import type { ButtonProps as AntButtonProps } from "antd";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps {
  variant?: Variant;
  loading?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Button({ variant = "primary", ...props }: ButtonProps) {
  const typeMap: Record<Variant, AntButtonProps["type"]> = {
    primary: "primary",
    secondary: "default",
    danger: "primary",
  };

  return (
    <AntButton
      type={typeMap[variant]}
      danger={variant === "danger"}
      {...props}
    />
  );
}












