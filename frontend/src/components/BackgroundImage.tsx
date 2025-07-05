import React from 'react';
import Image from 'next/image';

export default function BackgroundImage() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 w-full h-full z-0 overflow-hidden"
    >
      <Image
        src="/assets/background.png"
        alt="background"
        fill
        className="object-cover object-center opacity-10"
        priority={false}
      />
    </div>
  );
} 