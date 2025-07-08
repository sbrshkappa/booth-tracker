'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { markTourCompleted } from '@/utils/tour';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
  showOnPage: string; // Which page this step should show on
}

interface AppTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  isFirstTime?: boolean;
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Conference Companion! 👋',
    content: 'This app helps you explore conference booths and track your progress. Let\'s take a quick tour!',
    target: 'body',
    position: 'top',
    showOnPage: 'home'
  },
  {
    id: 'menu',
    title: 'Navigation Menu',
    content: 'Click the menu button to access different sections: Dashboard, Sessions, History, and more.',
    target: '.menu-container',
    position: 'left',
    showOnPage: 'home'
  },
  {
    id: 'current-session',
    title: 'Current Session',
    content: 'See what\'s happening right now at the conference. This shows the currently running session.',
    target: '.current-session, .countdown-timer, .text-center', // Fallback to countdown or any centered content
    position: 'bottom',
    showOnPage: 'home'
  },
  {
    id: 'sessions-intro',
    title: 'Sessions Schedule',
    content: 'Browse all conference sessions, filter by type, and see what\'s happening now.',
    target: '.sessions-content',
    position: 'top',
    showOnPage: 'sessions'
  },
  {
    id: 'session-card',
    title: 'Session Cards',
    content: 'Each card shows session details. Click to see more. Current sessions are highlighted with "NOW".',
    target: '.session-card',
    position: 'bottom',
    showOnPage: 'sessions'
  },
  {
    id: 'dashboard-intro',
    title: 'Booth Tracker Dashboard',
    content: 'Track your booth visits here. Enter phrases from booths to mark them as visited and see your progress.',
    target: '.dashboard-content',
    position: 'top',
    showOnPage: 'dashboard'
  },
  {
    id: 'progress-circle',
    title: 'Progress Circle',
    content: 'This circle shows your booth visit progress. The number shows booths visited out of total.',
    target: '.progress-circle',
    position: 'bottom',
    showOnPage: 'dashboard'
  },
  {
    id: 'phrase-input',
    title: 'Phrase Input',
    content: 'Get the secret phrase from each booth and enter it here. Add notes and rate your experience.',
    target: '.phrase-input',
    position: 'top',
    showOnPage: 'dashboard'
  },
  {
    id: 'history',
    title: 'My Journey',
    content: 'Review all your booth visits, notes, and ratings. Use the share button to email yourself a summary.',
    target: '.history-content',
    position: 'top',
    showOnPage: 'history'
  },
  {
    id: 'share-button',
    title: 'Share Your Journey',
    content: 'Click this button to email yourself a summary of all your booth visits and session notes.',
    target: '.share-button',
    position: 'left',
    showOnPage: 'history'
  },
  {
    id: 'completion',
    title: 'You\'re All Set! 🎉',
    content: 'You now know how to use Conference Companion! Visit booths, track sessions, and enjoy the conference!',
    target: 'body',
    position: 'top',
    showOnPage: 'home'
  }
];

export default function AppTour({ isOpen, onClose, onComplete, isFirstTime = false }: AppTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      
      // For first-time users, continue from where they left off
      // For manual tour starts, always start from the beginning (home page)
      let stepToStart = 0;
      
      if (isFirstTime) {
        // Check if we're continuing a first-time tour
        const savedStep = sessionStorage.getItem('tour-current-step');
        stepToStart = savedStep ? parseInt(savedStep, 10) : 0;
      } else {
        // Manual tour start - always begin from home page
        stepToStart = 0;
        sessionStorage.setItem('tour-current-step', '0');
      }
      
      setCurrentStep(stepToStart);
      // Mark that tour is in progress
      sessionStorage.setItem('tour-in-progress', 'true');
    } else {
      setIsVisible(false);
      // Clear tour in progress flag
      sessionStorage.removeItem('tour-in-progress');
      sessionStorage.removeItem('tour-current-step');
    }
  }, [isOpen, isFirstTime]);

  // Wrap positionTooltip in useCallback
  const positionTooltip = useCallback(() => {
    const currentStepData = tourSteps[currentStep];
    if (!currentStepData || !tooltipRef.current) return;

    // Try multiple selectors if the target contains commas (fallback selectors)
    const selectors = currentStepData.target.split(',').map(s => s.trim());
    let targetElement = null;
    
    for (const selector of selectors) {
      targetElement = document.querySelector(selector);
      if (targetElement) {
        break;
      }
    }
    
    const tooltip = tooltipRef.current;
    const overlay = overlayRef.current;

    if (!overlay) return;

    // If no target element found, use fallback positioning
    if (!targetElement) {
      
      // Position tooltip in the center of the screen for missing elements
      const tooltipRect = tooltip.getBoundingClientRect();
      const left = (window.innerWidth - tooltipRect.width) / 2;
      const top = (window.innerHeight - tooltipRect.height) / 2;
      
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      return;
    }

    const targetRect = targetElement.getBoundingClientRect();

    // Create highlight overlay
    const highlight = document.createElement('div');
    highlight.style.position = 'absolute';
    highlight.style.left = `${targetRect.left}px`;
    highlight.style.top = `${targetRect.top}px`;
    highlight.style.width = `${targetRect.width}px`;
    highlight.style.height = `${targetRect.height}px`;
    highlight.style.border = '2px solid #f97316';
    highlight.style.borderRadius = '8px';
    highlight.style.boxShadow = '0 0 0 9999px rgba(0, 0, 0, 0.5)';
    highlight.style.zIndex = '1000';
    highlight.className = 'tour-highlight';

    // Remove existing highlights
    const existingHighlights = overlay.querySelectorAll('.tour-highlight');
    existingHighlights.forEach(el => el.remove());
    overlay.appendChild(highlight);

    // Position tooltip
    const tooltipRect = tooltip.getBoundingClientRect();
    let left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
    let top = targetRect.top + targetRect.height + 20;

    // Adjust position based on step position preference
    switch (currentStepData.position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - 20;
        break;
      case 'bottom':
        top = targetRect.bottom + 20;
        break;
      case 'left':
        left = targetRect.left - tooltipRect.width - 20;
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        break;
      case 'right':
        left = targetRect.right + 20;
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        break;
    }

    // Ensure tooltip stays within viewport with better margins
    const margin = 16;
    const isMobile = window.innerWidth < 768;
    
    // Adjust margins for mobile
    const mobileMargin = isMobile ? 12 : margin;
    
    // Extra space for navigation buttons (especially important for mobile)
    const navigationSpace = isMobile ? 80 : 60;
    
    left = Math.max(mobileMargin, Math.min(left, window.innerWidth - tooltipRect.width - mobileMargin));
    top = Math.max(mobileMargin, Math.min(top, window.innerHeight - tooltipRect.height - mobileMargin - navigationSpace));

    // Special handling for menu step to avoid covering the menu button
    if (currentStepData.id === 'menu') {
      // On mobile, position below the menu button to avoid covering it
      if (isMobile) {
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        top = targetRect.bottom + 15;
      } else {
        // On desktop, try to position to the left first
        left = targetRect.left - tooltipRect.width - 20;
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
        
        // If it goes off-screen to the left, position it below instead
        if (left < mobileMargin) {
          left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
          top = targetRect.bottom + 20;
        }
      }
    }
    
    // Special handling for share button step
    if (currentStepData.id === 'share-button') {
      // Try positioning to the left of the share button first
      left = targetRect.left - tooltipRect.width - 20;
      top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      
      // If it goes off-screen to the left, try positioning above
      if (left < mobileMargin) {
        left = targetRect.left + targetRect.width / 2 - tooltipRect.width / 2;
        top = targetRect.top - tooltipRect.height - 20;
        
        // If it goes off-screen above, try positioning below
        if (top < mobileMargin) {
          top = targetRect.bottom + 20;
        }
      }
      
      // If it goes off-screen to the right, try positioning to the right of the button
      if (left + tooltipRect.width > window.innerWidth - mobileMargin) {
        left = targetRect.right + 20;
        top = targetRect.top + targetRect.height / 2 - tooltipRect.height / 2;
      }
      
      // Final check: if tooltip is still too low, position it higher
      if (top + tooltipRect.height > window.innerHeight - mobileMargin) {
        top = Math.max(mobileMargin, window.innerHeight - tooltipRect.height - mobileMargin - 60); // Extra space for navigation
      }
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }, [currentStep, tourSteps, isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const currentStepData = tourSteps[currentStep];
    if (!currentStepData) return;

    // Check if we need to navigate to a different page
    const currentPath = window.location.pathname;
    const targetPage = currentStepData.showOnPage;
    
    // If we're already navigating, wait for navigation to complete
    if (isNavigating) return;
    
    // Check if we need to navigate to a different page
    if (currentPath !== `/${targetPage}` && targetPage === 'home') {
      setIsNavigating(true);
      router.push('/home');
      return;
    } else if (currentPath !== `/${targetPage}` && targetPage !== 'home') {
      setIsNavigating(true);
      router.push(`/${targetPage}`);
      return;
    }

    // We're on the correct page, position the tooltip
    const timer = setTimeout(() => {
      positionTooltip();
    }, 200); // Increased delay to ensure page is fully loaded

    return () => clearTimeout(timer);
  }, [currentStep, isVisible, router, isNavigating, positionTooltip]);

  // Listen for route changes to reset navigation state
  useEffect(() => {
    const handleRouteChange = () => {
      if (isNavigating) {
        setIsNavigating(false);
      }
    };

    // Listen for route changes
    window.addEventListener('popstate', handleRouteChange);
    
    // Also check periodically if we're still navigating
    const checkNavigation = setInterval(() => {
      if (isNavigating) {
        // If we've been navigating for more than 2 seconds, assume it's complete
        setIsNavigating(false);
      }
    }, 2000);

    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      clearInterval(checkNavigation);
    };
  }, [isNavigating]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      sessionStorage.setItem('tour-current-step', nextStep.toString());
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      sessionStorage.setItem('tour-current-step', prevStep.toString());
    }
  };

  const handleComplete = () => {
    // Clear tour state
    sessionStorage.removeItem('tour-in-progress');
    sessionStorage.removeItem('tour-current-step');
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    // Mark the tour as completed for the user
    markTourCompleted();
    // Clear tour state
    sessionStorage.removeItem('tour-in-progress');
    sessionStorage.removeItem('tour-current-step');
    onClose();
  };

  if (!isVisible) return null;

  const currentStepData = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Overlay */}
      <div 
        ref={overlayRef}
        className="absolute inset-0 bg-black/50"
        onClick={handleSkip}
      />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-[280px] sm:max-w-xs"
        style={{ zIndex: 1001 }}
      >
        {/* Step indicator */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-xs text-gray-500">
            Step {currentStep + 1} of {tourSteps.length}
          </div>
          {!isFirstTime && (
            <button
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              ✕
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 mb-2">
          {currentStepData.title}
        </h3>

        {/* Content */}
        <p className="text-sm text-gray-700 mb-4 leading-relaxed">
          {currentStepData.content}
        </p>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrevious}
                className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-800 font-medium"
              >
                ← Previous
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {/* Always show Skip Tour except on last step */}
            {!isLastStep && (
              <button
                onClick={handleSkip}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 font-medium"
              >
                Skip Tour
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-[#f97316] text-white rounded text-xs hover:bg-[#ea580c] font-medium"
            >
              {isLastStep ? 'Finish' : 'Next →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 