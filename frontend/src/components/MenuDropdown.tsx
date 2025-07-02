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
          className="p-3 bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all duration-300"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <div className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out mt-1.5 ${menuOpen ? 'opacity-0 scale-0' : ''}`}></div>
            <div className={`w-6 h-0.5 bg-white transition-all duration-300 ease-in-out mt-1.5 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
          </div>
        </button>
        
        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
            {/* User Header */}
            {userName && (
              <>
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">👤</span>
                    <span className="font-semibold text-gray-900 truncate">{userName}</span>
                  </div>
                </div>
                {/* Separator */}
                <div className="border-t border-gray-200 my-1"></div>
              </>
            )}
            
            {/* Menu Options */}
            {options.map((option, index) => (
              <React.Fragment key={option.id}>
                {index > 0 && (option.isDanger || option.isAdmin) && (
                  <div className="border-t border-gray-200 my-2"></div>
                )}
                <button
                  onClick={() => handleMenuAction(option)}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 ${
                    option.isCurrent 
                      ? 'bg-orange-50 border-l-4 border-orange-500' 
                      : option.isDanger 
                        ? 'hover:bg-red-50' 
                        : option.isAdmin
                          ? 'hover:bg-yellow-50'
                          : 'hover:bg-blue-50'
                  }`}
                >
                  <span className="text-xl">{option.emoji}</span>
                  <span className={`font-medium ${
                    option.isDanger ? 'text-red-600' : 
                    option.isAdmin ? 'text-yellow-700' : 'text-gray-900'
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