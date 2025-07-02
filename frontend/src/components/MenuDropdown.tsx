"use client";
import React, { useState, useEffect } from "react";

interface MenuOption {
  id: string;
  label: string;
  emoji: string;
  action: () => void;
  isCurrent?: boolean;
  isDanger?: boolean;
  isAdmin?: boolean;
}

interface MenuDropdownProps {
  options: MenuOption[];
  className?: string;
  userName?: string;
}

const MenuDropdown: React.FC<MenuDropdownProps> = ({ options, className = "", userName }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.menu-container')) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuAction = (option: MenuOption) => {
    setMenuOpen(false);
    option.action();
  };

  return (
    <div className={`fixed top-6 right-6 z-[100] menu-container ${className}`}>
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-3 bg-gradient-to-r from-[#f97316] to-[#ec4899] rounded-xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[#f97316] focus:ring-offset-2 transition-all duration-300"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center relative">
            {/* Top line */}
            <div className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out absolute transform origin-center ${
              menuOpen ? 'rotate-45' : 'rotate-0 -translate-y-2'
            }`}></div>
            
            {/* Middle line */}
            <div className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out absolute transform origin-center ${
              menuOpen ? 'opacity-0 scale-x-0' : 'opacity-100 scale-x-100'
            }`}></div>
            
            {/* Bottom line */}
            <div className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out absolute transform origin-center ${
              menuOpen ? '-rotate-45' : 'rotate-0 translate-y-2'
            }`}></div>
          </div>
        </button>
        
        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-72 bg-purple-50/95 backdrop-blur-sm rounded-xl shadow-xl border border-purple-200 py-3 z-50">
            {/* User Header */}
            {userName && (
              <>
                <div className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#f97316] rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    <span className="font-semibold text-gray-900 truncate text-lg">{userName}</span>
                  </div>
                </div>
                {/* Elegant separator */}
                <div className="px-5">
                  <div className="h-px bg-gradient-to-r from-transparent via-purple-300 to-transparent"></div>
                </div>
              </>
            )}
            
            {/* Menu Options */}
            {options.map((option, index) => (
              <React.Fragment key={option.id}>
                {index > 0 && (option.isDanger || option.isAdmin) && (
                  <div className="border-t border-purple-200 my-2"></div>
                )}
                <button
                  onClick={() => handleMenuAction(option)}
                  className={`w-full px-5 py-4 text-left flex items-center gap-3 text-base transition-colors ${
                    option.isCurrent 
                      ? 'bg-[#f97316]/20 border-l-4 border-[#f97316]' 
                      : option.isDanger 
                        ? 'hover:bg-red-100' 
                        : option.isAdmin
                          ? 'hover:bg-[#f59e0b]/20'
                          : 'hover:bg-purple-100'
                  }`}
                >
                  <span className={`font-medium ${
                    option.isDanger ? 'text-red-600' : 
                    option.isAdmin ? 'text-[#f59e0b]' : 
                    option.isCurrent ? 'text-[#f97316]' : 'text-gray-700'
                  }`}>
                    {option.label}
                  </span>
                </button>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuDropdown; 