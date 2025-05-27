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
  const TIMBERS_WHITE = '#FFFFFF';
  
  // Clear the date/time area first
  ctx.save();
  ctx.fillStyle = 'transparent';
  ctx.clearRect(0, logoY - circleRadius - 500, width, 400);
  
  try {
    // Reset any transformations
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Get current date/time in Pacific timezone
    const pacificDate = new Date();
    
    const currentTime = pacificDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'America/Los_Angeles'
    }).replace(/\s?(AM|PM)$/i, '');

    const currentDate = new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      timeZone: 'America/Los_Angeles'
    }).format(pacificDate);

    // Reset any existing canvas transformations
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Draw date
    ctx.fillStyle = TIMBERS_WHITE;
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    
    const dateFont = Math.floor(width * 0.045);
    ctx.font = `${dateFont}px -apple-system, system-ui, "Helvetica Neue", "Segoe UI", Roboto, Arial, sans-serif`;
    ctx.fillText(currentDate, width / 2, logoY - circleRadius - 400);

    // Draw time
    const timeFont = Math.floor(width * 0.18);
    ctx.font = `bold ${timeFont}px -apple-system, system-ui, "Helvetica Neue", "Segoe UI", Roboto, Arial, sans-serif`;
    
    // Add text shadow for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    ctx.fillText(currentTime, width / 2, logoY - circleRadius - 200);
    
    // Reset shadow effects
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  } finally {
    // Always restore the canvas state
    ctx.restore();
  }
};
