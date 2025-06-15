// src/components/atoms/Textarea.tsx
type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
};

const Textarea = ({ value, onChange, placeholder }: Props) => (
  <textarea
    className="border rounded px-2 py-1 w-full"
    rows={4}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
  />
);

export default Textarea;
