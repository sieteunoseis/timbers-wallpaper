import { clearTextEffects } from './textEffects';

/**
 * Format a date string for display in the UI
 * @param {string} dateTimeString - The date/time string from the API
 * @returns {string} - Formatted date string
 */
export const formatDate = dateTimeString => {
  // The API provides UTC datetime strings like "2025-07-06 02:30:00"
  // We need to treat this as UTC and convert to Pacific
  const utcDate = new Date(dateTimeString + ' UTC'); // Explicitly mark as UTC
  return utcDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Los_Angeles',
  });
};

/**
 * Format a time string for display in the UI
 * @param {string} dateTimeString - The date/time string from the API
 * @returns {string} - Formatted time string
 */
export const formatTime = dateTimeString => {
  // Convert UTC datetime to Pacific time
  const utcDate = new Date(dateTimeString + ' UTC'); // Explicitly mark as UTC
  return utcDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'America/Los_Angeles',
  });
};

/**
 * Format a date string for display on the wallpaper
 * @param {string} dateTimeString - The date/time string from the API
 * @returns {string} - Formatted date string for wallpaper
 */
export const formatDateForWallpaper = dateTimeString => {
  // Convert UTC datetime to Pacific time for wallpaper display
  const utcDate = new Date(dateTimeString + ' UTC'); // Explicitly mark as UTC
  return utcDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Los_Angeles',
  });
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
