// app/src/components/atoms/Input.tsx
import React from "react";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  id: string; // 必須: ラベルとの関連付けに必要
  label: string; // 必須: ラベルテキスト
};

const Input = ({ value, onChange, placeholder, id, label }: Props) => (
  <div className="w-full">
    <label htmlFor={id} className="block mb-1 text-sm font-medium">
      {label}
    </label>
    <input
      id={id}
      className="border rounded px-2 py-1 w-full"
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

export default Input;
