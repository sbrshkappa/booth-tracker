"use client";
import React, { useState } from "react";
import TextInput from "../components/TextInput";
import PrimaryButton from "../components/PrimaryButton";
import InfoIcon from "../components/InfoIcon";

const RegistrationScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [badgeNumber, setBadgeNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call registration API
    alert("Registration submitted! (API integration coming soon)");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-white px-2 py-4 sm:px-4 sm:py-8 w-full overflow-x-hidden">
      {/* Placeholder for logo and event title */}
      <div className="flex flex-col items-center mb-4 sm:mb-6 w-full">
        <div className="w-24 h-12 sm:w-32 sm:h-16 bg-gradient-to-r from-yellow-400 to-purple-600 rounded-full mb-2 flex items-center justify-center">
          <span className="text-2xl sm:text-3xl font-bold text-white">Logo</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-blue-900 text-center leading-tight">SSIO National Conference & Children's festival 2025</h2>
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-blue-800 mb-1 sm:mb-2 text-center">Digital Seva Explorer</h1>
      <h2 className="text-base sm:text-lg font-semibold text-blue-800 mb-3 sm:mb-4 text-center">Let's get you registered</h2>
      <form onSubmit={handleSubmit} className="w-full max-w-[95vw] sm:max-w-md flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <TextInput
          label="Email"
          value={email}
          onChange={setEmail}
          type="email"
          required
        />
        <TextInput
          label="First Name"
          value={firstName}
          onChange={setFirstName}
          required
        />
        <TextInput
          label="Last Name"
          value={lastName}
          onChange={setLastName}
          required
        />
        <div className="relative">
          <TextInput
            label="Badge Number"
            value={badgeNumber}
            onChange={setBadgeNumber}
            required
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <InfoIcon />
          </span>
        </div>
        <PrimaryButton type="submit">Register</PrimaryButton>
      </form>
      <div className="text-gray-700 text-xs sm:text-sm max-w-[95vw] sm:max-w-md w-full">
        <h3 className="font-semibold mb-1 sm:mb-2">How it works:</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Visit each booth to discover how SSSIO-USA uplifts communities through love and selfless service.</li>
          <li>Collect secret phrases along the way to unlock your journey.</li>
          <li>Complete all booths to experience the full impact—and qualify for a raffle!</li>
        </ul>
        {/* Placeholder for bottom logo */}
        <div className="flex justify-center mt-3 sm:mt-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-500">Logo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationScreen; 