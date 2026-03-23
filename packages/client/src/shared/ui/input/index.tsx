import { Input as AntInput } from "antd";

interface InputProps {
  value?: string;
  placeholder?: string;
  onChange?: (v: string) => void;
}

export function Input({ value, placeholder, onChange }: InputProps) {
  return (
    <AntInput
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}












