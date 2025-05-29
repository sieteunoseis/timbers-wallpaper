/**
 * iOS Font utility functions for creating authentic iOS-style dates and times
 */

/**
 * Get iOS system font stack for text elements
 * @returns {string} CSS font-family string
 */
export const getIOSSystemFontFamily = () => {
  return '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif';
};

/**
 * Get formatted time string in iOS style (12-hour format without AM/PM suffix)
 * @returns {string} Formatted time string
 */
export function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles'
  }).replace(/\s?(AM|PM)$/i, '');
}

/**
 * Get formatted date string in iOS style
 * @param {boolean} useFullWeekday - Whether to use full weekday names (Monday vs Mon)
 * @returns {string} Formatted date string
 */
export function getCurrentDate(useFullWeekday = true) {
  const now = new Date();
  return now.toLocaleDateString('en-US', {
    weekday: useFullWeekday ? 'long' : 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Los_Angeles'
  });
}
