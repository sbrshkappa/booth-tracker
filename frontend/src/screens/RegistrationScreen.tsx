"use client"
import React, { useState } from "react";
import TextInput from "../components/TextInput";
import PrimaryButton from "../components/PrimaryButton";
import InfoIcon from "../components/InfoIcon";
import Link from "next/link";

const RegistrationScreen: React.FC = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [badgeNumber, setBadgeNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess(false);

    // Client-side validation
    if (!email || !firstName || !lastName || !badgeNumber) {
      setError("All fields are required. Please fill in all information.");
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/registerUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          first_name: firstName,
          last_name: lastName,
          badge_number: badgeNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Registration successful
      setSuccess(true);
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const isDuplicateUserError = error.includes('already exists');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-2 py-4 sm:px-4 sm:py-8 w-full overflow-x-hidden">
      {/* Placeholder for logo and event title */}
      <div className="flex flex-col items-center mb-8 sm:mb-10 w-full">
        <div className="w-24 h-12 sm:w-32 sm:h-16 bg-gradient-to-r from-yellow-400 to-purple-600 rounded-full mb-2 flex items-center justify-center">
          <span className="text-2xl sm:text-3xl font-bold text-white">Logo</span>
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-blue-900 text-center leading-tight">SSIO National Conference & Children's festival 2025</h2>
      </div>
      <h1 className="text-xl sm:text-2xl font-bold text-blue-800 mb-1 sm:mb-2 text-center">Digital Seva Explorer</h1>
      <h2 className="text-base sm:text-lg font-semibold text-blue-800 mb-6 sm:mb-8 text-center">Let's get you registered</h2>
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
        <PrimaryButton type="submit" disabled={isLoading}>
          {isLoading ? "Registering..." : "Register"}
        </PrimaryButton>
      </form>
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm text-center mt-2 max-w-[95vw] sm:max-w-md p-3 rounded-lg">
          ✅ Registration successful! Redirecting to login...
        </div>
      )}
      
      {error && (
        <div className={`border text-sm text-center mt-2 max-w-[95vw] sm:max-w-md p-3 rounded-lg ${
          isDuplicateUserError 
            ? 'bg-blue-50 border-blue-200 text-blue-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {isDuplicateUserError ? (
            <div>
              <div className="font-semibold mb-1">User Already Exists</div>
              <div>{error}</div>
            </div>
          ) : (
            <div className="font-semibold">{error}</div>
          )}
        </div>
      )}
      
      <div className="text-center mt-2 text-sm text-gray-700">
        Already have an account?{' '}
        <Link href="/" className="text-blue-700 font-semibold underline">Login here</Link>
      </div>
    </div>
  );
};

export default RegistrationScreen;