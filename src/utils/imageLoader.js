/**
 * Helper function to load images with CORS support
 * @param {string} src - The image source URL
 * @returns {Promise<HTMLImageElement>} - Promise resolving to the loaded image
 */
export const tryLoadImage = src => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS from the start
    img.onload = () => resolve(img);
    img.onerror = () => {
      // If CORS fails, try without crossOrigin (but this will taint the canvas)
      console.log(`CORS failed for ${src}, using fallback`);
      reject(new Error(`Failed to load: ${src}`));
    };
    img.src = src;
  });
};

/**
 * Creates a fallback logo when an image fails to load
 * @param {string} text - Text to display in the fallback logo
 * @param {boolean} isTimbers - Whether this is a Timbers logo (affects colors)
 * @returns {HTMLCanvasElement} - Canvas element with the fallback logo
 */
export const createFallbackLogo = (text, isTimbers = false) => {
  const TIMBERS_GREEN = '#004225';
  const TIMBERS_WHITE = '#FFFFFF';
  const size = 100;
  
  const fallbackCanvas = document.createElement('canvas');
  fallbackCanvas.width = size;
  fallbackCanvas.height = size;
  const fallbackCtx = fallbackCanvas.getContext('2d');

  // Draw circle background
  fallbackCtx.fillStyle = isTimbers ? TIMBERS_GREEN : '#555555';
  fallbackCtx.beginPath();
  fallbackCtx.arc(size / 2, size / 2, size / 2, 0, 2 * Math.PI);
  fallbackCtx.fill();

  // Draw text
  fallbackCtx.fillStyle = TIMBERS_WHITE;
  fallbackCtx.font = 'bold 24px Arial';
  fallbackCtx.textAlign = 'center';
  fallbackCtx.textBaseline = 'middle';
  fallbackCtx.fillText(text, size / 2, size / 2);

  return fallbackCanvas;
};
