// app/src/components/atoms/Input.tsx
import React from "react";
import { FORM_STYLES } from "@/components/utils/styles";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  id: string; // 必須: ラベルとの関連付けに必要
  label: string; // 必須: ラベルテキスト
};

const Input = ({ value, onChange, placeholder, id, label }: Props) => (
  <div className={FORM_STYLES.container}>
    <label htmlFor={id} className={FORM_STYLES.label}>
      {label}
    </label>
    <input
      id={id}
      className={FORM_STYLES.input}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

export default Input;
