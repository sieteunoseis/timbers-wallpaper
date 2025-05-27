import { debugLog } from './debug';
/**
 * Helper function to load images with CORS support and iOS-specific handling
 * @param {string} src - The image source URL
 * @returns {Promise<HTMLImageElement>} - Promise resolving to the loaded image
 */
export const tryLoadImage = src => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    // Enhanced iOS detection with Safari check
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isIOSBrowser = isIOS || (isSafari && isIOS);
    
    // Check if the image is local or from an external source
    const isSameOrigin = src.startsWith('/') || src.startsWith(window.location.origin);
    const isDataUrl = src.startsWith('data:');
    
    // Determine if we should attempt to use crossOrigin
    // Do not use crossOrigin for iOS browsers, local files, or data URLs
    if (!isIOSBrowser && !isSameOrigin && !isDataUrl) {
      img.crossOrigin = 'anonymous';
      debugLog(`Loading with CORS: ${src}`);
    } else if (isIOSBrowser) {
      debugLog(`Loading on iOS (without CORS): ${src}`);
    }
    
    img.onload = () => {
      debugLog(`Successfully loaded: ${src}`);
      resolve(img);
    };
    
    img.onerror = () => {
      // If loading fails and we tried with crossOrigin, try again without it
      if (img.crossOrigin) {
        debugLog(`CORS failed for ${src}, trying without crossOrigin`);
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          debugLog(`Fallback loaded (tainted canvas): ${src}`);
          resolve(fallbackImg);
        };
        fallbackImg.onerror = () => {
          console.error(`Failed to load image even without CORS: ${src}`);
          reject(new Error(`Failed to load: ${src}`));
        };
        fallbackImg.src = src;
      } else {
        console.error(`Failed to load image: ${src}`);
        reject(new Error(`Failed to load: ${src}`));
      }
    };
    
    // Set cache-busting parameter for iOS Safari, which has aggressive caching
    // This helps ensure we always get a fresh version of the image
    const cacheBuster = isIOSBrowser && !isDataUrl ? 
      (src.includes('?') ? `&_cache=${Date.now()}` : `?_cache=${Date.now()}`) : '';
    
    img.src = `${src}${cacheBuster}`;
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
