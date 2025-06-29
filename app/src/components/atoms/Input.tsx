// src/components/atoms/Input.tsx
type Props = {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
};

const Input = ({ value, onChange, placeholder }: Props) => (
  <input
    className="border rounded px-2 py-1 w-full"
    type="text"
    value={value}
    onChange={onChange}
    placeholder={placeholder}
  />
);

export default Input;
