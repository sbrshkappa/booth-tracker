import React from "react";

type TextInputProps = {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
  required?: boolean;
};

const TextInput: React.FC<TextInputProps> = ({ label, value, onChange, type = "text", required = false }) => {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-base font-medium text-gray-800">{label}</label>
      <input
        className="rounded-xl border-2 border-orange-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-base text-gray-900 bg-white placeholder-gray-500"
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        placeholder={label}
      />
    </div>
  );
};

export default TextInput;