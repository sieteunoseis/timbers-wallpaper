import { clearTextEffects } from './textEffects';

/**
 * Parse a date string in a way that works across browsers (including iOS Safari)
 * @param {string} dateTimeString - The date/time string from the API
 * @returns {Date} - A JavaScript Date object
 */
const parseDateSafely = dateTimeString => {
  try {
    // Handle empty or invalid input
    if (!dateTimeString) return null;

    // The API provides UTC datetime strings like "2025-07-06 02:30:00" or "2025-07-06"
    // Split into components for cross-browser compatibility, especially iOS Safari
    const parts = dateTimeString.split(' ');
    const dateParts = parts[0].split('-');
    
    if (parts.length >= 2) {
      // Has time components - "2025-07-06 02:30:00"
      const timeParts = parts[1].split(':');
      
      // Create date using individual components for maximum compatibility
      return new Date(Date.UTC(
        parseInt(dateParts[0], 10),    // year
        parseInt(dateParts[1], 10) - 1, // month (0-based)
        parseInt(dateParts[2], 10),    // day
        parseInt(timeParts[0], 10),    // hour
        parseInt(timeParts[1], 10),    // minute
        parseInt(timeParts[2] || 0, 10) // second (default to 0)
      ));
    } else {
      // Date only - "2025-07-06"
      return new Date(Date.UTC(
        parseInt(dateParts[0], 10),    // year
        parseInt(dateParts[1], 10) - 1, // month (0-based)
        parseInt(dateParts[2], 10)     // day
      ));
    }
  } catch (e) {
    console.error('Error parsing date:', e, dateTimeString);
    return null;
  }
};

/**
 * Format a date string for display in the UI
 * @param {string} dateTimeString - The date/time string from the API
 * @returns {string} - Formatted date string
 */
export const formatDate = dateTimeString => {
  // Parse the date safely for iOS compatibility
  const parsedDate = parseDateSafely(dateTimeString);
  if (!parsedDate) return 'TBD';
  
  try {
    return parsedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Los_Angeles',
    });
  } catch (e) {
    console.error('Error formatting date:', e);
    return 'TBD';
  }
};

/**
 * Format a time string for display in the UI
 * @param {string} dateTimeString - The date/time string from the API
 * @returns {string} - Formatted time string
 */
export const formatTime = dateTimeString => {
  // Parse the date safely for iOS compatibility
  const parsedDate = parseDateSafely(dateTimeString);
  if (!parsedDate) return 'TBD';
  
  try {
    return parsedDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Los_Angeles',
    });
  } catch (e) {
    console.error('Error formatting time:', e);
    return 'TBD';
  }
};

/**
 * Format a date string for display on the wallpaper
 * @param {string} dateTimeString - The date/time string from the API
 * @returns {string} - Formatted date string for wallpaper
 */
export const formatDateForWallpaper = dateTimeString => {
  // Parse the date safely for iOS compatibility
  const parsedDate = parseDateSafely(dateTimeString);
  if (!parsedDate) return 'TBD';
  
  try {
    return parsedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Los_Angeles',
    });
  } catch (e) {
    console.error('Error formatting wallpaper date:', e);
    return 'TBD';
  }
};

/**
 * Draw current date and time on the wallpaper
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} logoY - Y position of the logo
 * @param {number} circleRadius - Radius of the circular logo
 */
export const drawDateAndTime = (ctx, width, logoY, circleRadius) => {
  if (!ctx) return;
  
  const TIMBERS_WHITE = '#FFFFFF';
  
  // Get current date/time
  const now = new Date();
  
  const currentTime = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles'
  }).replace(/\s?(AM|PM)$/i, '');

  const currentDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Los_Angeles'
  });

  // Completely reset all text effects and context state before drawing anything
  clearTextEffects(ctx);
  
  // Draw date
  ctx.fillStyle = TIMBERS_WHITE;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  
  const dateFont = Math.floor(width * 0.045);
  ctx.font = `${dateFont}px -apple-system, system-ui, "Helvetica Neue", "Segoe UI", Roboto, Arial, sans-serif`;
  ctx.fillText(currentDate, width / 2, logoY - circleRadius - 400);

  // Reset effects completely before drawing the time
  clearTextEffects(ctx);
  
  // Set up time text properties
  ctx.fillStyle = TIMBERS_WHITE;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  const timeFont = Math.floor(width * 0.18);
  ctx.font = `bold ${timeFont}px -apple-system, system-ui, "Helvetica Neue", "Segoe UI", Roboto, Arial, sans-serif`;
  
  // Draw time
  ctx.fillText(currentTime, width / 2, logoY - circleRadius - 200);
  
  // Make sure all effects are cleared before we exit the function
  clearTextEffects(ctx);
};
