import React from "react";

type PrimaryButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
};

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, type = "button", disabled = false }) => (
  <button
    type={type}
    disabled={disabled}
    className={`w-full text-white text-xl font-bold py-3 rounded-xl mt-2 transition-colors ${
      disabled 
        ? 'bg-gray-400 cursor-not-allowed' 
        : 'bg-blue-800 hover:bg-blue-900'
    }`}
  >
    {children}
  </button>
);

export default PrimaryButton;