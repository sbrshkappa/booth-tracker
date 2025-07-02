import React from 'react';

export default function BackgroundImage() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 w-full h-full z-0 overflow-hidden"
    >
      <img
        src="/assets/background.png"
        alt="background"
        className="object-cover object-center absolute top-0 left-1/2 -translate-x-1/2 w-[200vw] h-full max-w-none opacity-10"
      />
    </div>
  );
} 