import React from 'react';

export default function BackgroundImage() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none select-none absolute inset-0 w-full h-full z-0 flex justify-center items-center"
      style={{ overflow: 'hidden' }}
    >
      <img
        src="/assets/background.png"
        alt="background"
        className="object-cover object-left opacity-10 w-[200vw] max-w-none h-full mx-auto hidden sm:block"
        style={{ left: 0, position: 'absolute', top: 0, height: '100%', zIndex: 0 }}
      />
      <img
        src="/assets/background.png"
        alt="background"
        className="object-cover object-left opacity-10 w-[200vw] max-w-none h-full mx-auto block sm:hidden"
        style={{ left: 0, position: 'absolute', top: 0, height: '100%', zIndex: 0 }}
      />
    </div>
  );
} 