// app/src/components/atoms/Textarea.tsx
import React from "react";
import { FORM_STYLES } from "@/components/utils/styles";
import { cn } from "@/components/utils/cn";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  id: string; // 必須
  label: string; // 必須
  disabled?: boolean; // 無効化プロパティ追加
};

const Textarea = ({
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
    <textarea
      id={id}
      className={cn(
        FORM_STYLES.input,
        disabled &&
          "opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800",
      )}
      rows={4}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  </div>
);

export default Textarea;
