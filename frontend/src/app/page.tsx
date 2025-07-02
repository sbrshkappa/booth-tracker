"use client";
import React, { useState } from "react";
import TextInput from "../components/TextInput";
import PrimaryButton from "../components/PrimaryButton";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Client-side validation
    if (!email.trim()) {
      setError("Email is required.");
      setIsLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/api/loginUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server returned an invalid response format');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Validate response structure
      if (!data.data || !data.data.user) {
        throw new Error('Invalid response from server');
      }

      // Login successful - store user data and redirect to dashboard
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('userProgress', JSON.stringify(data.data.progress));
      
      // Redirect to dashboard
      window.location.href = '/dashboard';
      
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Request timed out. Please check your connection and try again.');
        } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setError('Network error. Please check your internet connection and try again.');
        } else if (err.message.includes('Invalid response')) {
          setError('Server error. Please try again later.');
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    // Clear error when user starts typing
    if (error) {
      setError("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-2 py-4 sm:px-4 w-full overflow-x-hidden">
      <div className="flex flex-col items-center mb-8 w-full">
        <div className="mb-4">
          <Image
            src="/assets/conference-companion.png"
            alt="Conference Companion Logo"
            width={200}
            height={100}
            className="w-auto h-16 sm:h-20 object-contain"
            priority
          />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-black mb-1 sm:mb-2 text-center">Conference Companion</h1>
      </div>
      <form onSubmit={handleSubmit} className="w-full max-w-[95vw] sm:max-w-md flex flex-col gap-4 mb-4">
        <TextInput
          label="Email"
          value={email}
          onChange={handleEmailChange}
          type="email"
          required
        />
        <PrimaryButton type="submit" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Continue"}
        </PrimaryButton>
      </form>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 text-sm text-center mt-2 max-w-[95vw] sm:max-w-md p-3 rounded-lg">
          <div className="font-semibold">{error}</div>
        </div>
      )}
      
      <div className="text-center mt-2 text-sm text-gray-700">
        New User?{' '}
        <Link href="/register" className="text-[#fe84a0] font-semibold underline">Register Here</Link>
      </div>
    </div>
  );
}
