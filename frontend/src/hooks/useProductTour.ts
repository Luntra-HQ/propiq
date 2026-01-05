import { useState, useEffect } from 'react';

/**
 * Hook to determine if product tour should be shown
 *
 * Returns true if user hasn't completed or skipped the tour
 */
export const useShouldShowTour = (): boolean => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem('propiq_tour_completed');
    const skipped = localStorage.getItem('propiq_tour_skipped');

    // Show tour if user hasn't completed or skipped it
    setShouldShow(!completed && !skipped);
  }, []);

  return shouldShow;
};
