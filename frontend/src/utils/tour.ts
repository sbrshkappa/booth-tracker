// Tour utility functions

// Test mode - set to true to force tour to show every time (for development/testing)
const TOUR_TEST_MODE = process.env.NODE_ENV === 'development' && (
  process.env.NEXT_PUBLIC_FORCE_TOUR === 'true' || 
  (typeof window !== 'undefined' && localStorage.getItem('force-tour-test-mode') === 'true')
);

export interface TourState {
  hasCompletedTour: boolean;
  hasSeenFirstTimeTour: boolean;
}

const DEFAULT_TOUR_STATE: TourState = {
  hasCompletedTour: false,
  hasSeenFirstTimeTour: false,
};

const TOUR_STORAGE_KEY = 'conference-companion-tour';

export const getTourState = (): TourState => {
  if (typeof window === 'undefined') {
    return DEFAULT_TOUR_STATE;
  }
  
  try {
    const stored = localStorage.getItem(TOUR_STORAGE_KEY);
    
    if (!stored) {
      return DEFAULT_TOUR_STATE;
    }
    
    const parsed = JSON.parse(stored);
    return { ...DEFAULT_TOUR_STATE, ...parsed };
  } catch (error) {
    console.error('🎯 Tour: Error parsing tour state:', error);
    return DEFAULT_TOUR_STATE;
  }
};

export const setTourState = (state: Partial<TourState>) => {
  if (typeof window === 'undefined') return;

  try {
    const currentState = getTourState();
    const newState = { ...currentState, ...state };
    localStorage.setItem(TOUR_STORAGE_KEY, JSON.stringify(newState));
  } catch (error) {
    console.warn('Failed to save tour state to localStorage:', error);
  }
};

export const markTourCompleted = () => {
  setTourState({
    hasCompletedTour: true,
    hasSeenFirstTimeTour: true,
  });
};

export const markFirstTimeTourSeen = () => {
  setTourState({
    hasSeenFirstTimeTour: true,
  });
};

export const shouldShowFirstTimeTour = (): boolean => {
  // In test mode, always show the tour
  if (TOUR_TEST_MODE) {
    return true;
  }
  
  const state = getTourState();
  
  return !state.hasSeenFirstTimeTour;
};

export const resetTourState = () => {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    // Also clear sessionStorage tour state
    sessionStorage.removeItem('tour-in-progress');
    sessionStorage.removeItem('tour-current-step');
    console.log('🎯 Tour: State reset successfully');
  } catch (error) {
    console.warn('Failed to reset tour state:', error);
  }
};

// Development helper - expose reset function globally for easy testing
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).resetTour = resetTourState;
  (window as any).toggleTourTestMode = () => {
    const current = localStorage.getItem('force-tour-test-mode');
    if (current === 'true') {
      localStorage.removeItem('force-tour-test-mode');
      console.log('🎯 Tour: Test mode disabled');
    } else {
      localStorage.setItem('force-tour-test-mode', 'true');
      console.log('🎯 Tour: Test mode enabled');
    }
  };
  console.log('🎯 Tour: Reset function available as window.resetTour()');
  console.log('🎯 Tour: Toggle test mode with window.toggleTourTestMode()');
} 