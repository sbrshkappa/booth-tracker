import React from "react";

type PrimaryButtonProps = {
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
};

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ children, type = "button" }) => (
  <button
    type={type}
    className="w-full bg-blue-800 text-white text-xl font-bold py-3 rounded-xl mt-2 hover:bg-blue-900 transition-colors"
  >
    {children}
  </button>
);

export default PrimaryButton; 