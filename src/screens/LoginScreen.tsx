"use client";
import React, { useState } from "react";
import TextInput from "../components/TextInput";
import PrimaryButton from "../components/PrimaryButton";
import Link from "next/link";

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle login logic
    alert(`Continue with email: ${email}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-2 py-4 sm:px-4 w-full overflow-x-hidden">
      <div className="flex flex-col items-center mb-8 w-full">
        <div className="w-24 h-12 sm:w-32 sm:h-16 bg-gradient-to-r from-yellow-400 to-purple-600 rounded-full mb-2 flex items-center justify-center">
          <span className="text-2xl sm:text-3xl font-bold text-white">Logo</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-blue-800 mb-1 sm:mb-2 text-center">Digital Seva Explorer</h1>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-[95vw] sm:max-w-md flex flex-col gap-4 mb-4">
        <TextInput
          label="Email"
          value={email}
          onChange={setEmail}
          type="email"
          required
        />
        <PrimaryButton type="submit">Continue</PrimaryButton>
      </form>
      <div className="text-center mt-2 text-sm">
        New User?{' '}
        <Link href="/register" className="text-blue-700 font-semibold underline">Register Here</Link>
      </div>
    </div>
  );
};

export default LoginScreen; 