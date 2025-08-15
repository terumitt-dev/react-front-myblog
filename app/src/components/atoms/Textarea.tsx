// app/src/components/atoms/Textarea.tsx
import React from "react";
import { FORM_STYLES } from "@/components/utils/styles";

type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  id: string; // 必須
  label: string; // 必須
};

const Textarea = ({ value, onChange, placeholder, id, label }: Props) => (
  <div className={FORM_STYLES.container}>
    <label htmlFor={id} className={FORM_STYLES.label}>
      {label}
    </label>
    <textarea
      id={id}
      className={FORM_STYLES.input}
      rows={4}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  </div>
);

export default Textarea;
