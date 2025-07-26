// app/src/components/atoms/Textarea.tsx
import React from "react";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  id: string; // 必須
  label: string; // 必須
};

const Textarea = ({ value, onChange, placeholder, id, label }: Props) => (
  <div className="w-full">
    <label htmlFor={id} className="block mb-1 text-sm font-medium">
      {label}
    </label>
    <textarea
      id={id}
      className="border rounded px-2 py-1 w-full"
      rows={4}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

export default Textarea;
