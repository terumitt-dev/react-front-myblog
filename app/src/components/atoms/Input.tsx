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
    <label
      htmlFor={id}
      className="block mb-1 text-sm font-medium text-gray-700 dark:text-gray-300"
    >
      {label}
    </label>
    <input
      id={id}
      className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 w-full bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

export default Input;
