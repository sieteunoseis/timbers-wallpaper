import { formatDateForWallpaper, formatTime } from '../utils/dateFormatters';
import { getNext4Matches } from '../utils/scheduleUtils';

/**
 * Hook for handling schedule data processing and extraction
 * 
 * @returns {Object} Schedule data and helper functions
 */
const useScheduleData = () => {
  const nextMatches = getNext4Matches();

  return {
    nextMatches,
    formatDateForWallpaper,
    formatTime
  };
};

export default useScheduleData;
