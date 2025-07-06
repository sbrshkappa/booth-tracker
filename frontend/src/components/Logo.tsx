import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  showNavigation?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  className = "h-12 w-auto", 
  width = 48, 
  height = 48,
  showNavigation = true 
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (showNavigation) {
      router.push('/home');
    }
  };

  return (
    <Image 
      src="/assets/conference-companion.png" 
      alt="Conference Companion" 
      width={width}
      height={height}
      className={`${className} ${showNavigation ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={handleClick}
    />
  );
};

export default Logo; 