// app/src/components/atoms/Input.tsx
import React from "react";
import { FORM_STYLES } from "@/components/utils/styles";
import { cn } from "@/components/utils/cn";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  id: string; // 必須: ラベルとの関連付けに必要
  label: string; // 必須: ラベルテキスト
  disabled?: boolean; // 無効化プロパティ追加
};

const Input = ({
  value,
  onChange,
  placeholder,
  id,
  label,
  disabled = false,
}: Props) => (
  <div className={FORM_STYLES.container}>
    <label htmlFor={id} className={FORM_STYLES.label}>
      {label}
    </label>
    <input
      id={id}
      className={cn(
        FORM_STYLES.input,
        disabled &&
          "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800",
      )}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  </div>
);

export default Input;
