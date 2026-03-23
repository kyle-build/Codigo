import { Checkbox as AntCheckbox } from "antd";

interface CheckProps {
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Check({ checked, disabled, onChange }: CheckProps) {
  return (
    <AntCheckbox
      checked={checked}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.checked)}
    />
  );
}












