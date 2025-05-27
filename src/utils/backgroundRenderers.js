import { tryLoadImage } from './imageLoader';
import { debugLog, debugWarn, debugError } from './debug';

// Portland Timbers brand colors
export const TIMBERS_GREEN = '#004812'; // Updated green to match gradient
export const TIMBERS_GOLD = '#EAE827'; // Updated gold to match gradient
export const TIMBERS_WHITE = '#FFFFFF';

/**
 * Generate theme-specific background for the wallpaper
 * @param {string} selectedTheme - The theme ID
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Array} backgroundThemes - Array of background themes from manifest
 * @returns {Promise<HTMLImageElement|CanvasGradient>} - Image or gradient for background
 */
export const getThemeBackground = async (selectedTheme, ctx, width, height, backgroundThemes = []) => {
  // Find the selected theme in the backgroundThemes array
  const theme = backgroundThemes.find(theme => theme.value === selectedTheme);

  // If we found the theme in the manifest and it's an image type
  if (theme && theme.type === 'image' && theme.filename) {
    try {
      const backgroundImg = await tryLoadImage(`/background/${theme.filename}`);
      debugLog(`${theme.label} background loaded successfully`);
      return backgroundImg;
    } catch (error) {
      debugWarn(`Failed to load ${theme.label} background, falling back to classic theme:`, error);
      // Fallback to classic theme if image fails to load
      return createFallbackGradient(ctx, width, height);
    }
  } 
  
  // If we found the theme in the manifest and it's a gradient type
  if (theme && theme.type === 'gradient') {
    return createGradientFromTheme(theme, ctx, width, height);
  }

  // Legacy handler for backward compatibility with hard-coded themes
  // This will run if the theme wasn't found in the manifest array
  switch (selectedTheme) {
    case 'timber_jim': {
      // Load and return the static Timber Jim background
      try {
        const timberJimImg = await tryLoadImage('/background/timber_jim.webp');
        debugLog('Timber Jim background loaded successfully');
        return timberJimImg;
      } catch (error) {
        debugWarn('Failed to load Timber Jim background, falling back to classic theme:', error);
        return createFallbackGradient(ctx, width, height);
      }
    }
    case 'providence': {
      // Providence Park theme - Stadium lights effect
      const grad = ctx.createRadialGradient(width/2, 0, 0, width/2, height/2, width);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.2, '#004225');
      grad.addColorStop(0.6, '#002815');
      grad.addColorStop(1, '#001a0d');
      return grad;
    }
    case 'rose': {
      // Rose City theme - Deep reds and greens
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#4a1c1c');
      grad.addColorStop(0.4, '#004225');
      grad.addColorStop(0.7, '#002815');
      grad.addColorStop(1, '#000000');
      return grad;
    }
    case 'timber': {
      // Timber Joey theme - Wood grain inspired
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#4d2600');
      grad.addColorStop(0.3, '#004225');
      grad.addColorStop(0.7, '#002815');
      grad.addColorStop(1, '#000000');
      return grad;
    }
    case 'forest': {
      // Forest theme - Deep greens with nature gradient
      const forestGradient = ctx.createRadialGradient(width / 2, height / 3, 0, width / 2, height, width);
      forestGradient.addColorStop(0, '#1a4c33'); // Dark forest green
      forestGradient.addColorStop(0.4, '#0d3b2a'); // Deeper green
      forestGradient.addColorStop(0.7, '#062820'); // Very dark green
      forestGradient.addColorStop(1, '#041a16'); // Almost black green
      return forestGradient;
    }
    case 'night': {
      // Night theme - Deep blues and blacks with subtle stars
      const nightGradient = ctx.createRadialGradient(width / 2, 0, 0, width / 2, height, width);
      nightGradient.addColorStop(0, '#1a1a2e'); // Dark blue
      nightGradient.addColorStop(0.3, '#16213e'); // Navy blue
      nightGradient.addColorStop(0.6, '#0f1419'); // Very dark blue
      nightGradient.addColorStop(1, '#000000'); // Black
      return nightGradient;
    }
    case 'classic':
    default: {
      // Classic theme - Timbers gold to Timbers green gradient
      return createFallbackGradient(ctx, width, height);
    }
  }
};

/**
 * Create a gradient from theme data
 * @param {Object} theme - Theme object from manifest
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {CanvasGradient} - The created gradient
 */
const createGradientFromTheme = (theme, ctx, width, height) => {
  // Fallback to classic if theme is not found
  if (!theme) {
    return createFallbackGradient(ctx, width, height);
  }

  let gradient;

  // Create the right type of gradient based on theme data
  if (theme.gradientType === 'linear') {
    if (theme.gradientDirection === 'vertical') {
      gradient = ctx.createLinearGradient(0, 0, 0, height);
    } else if (theme.gradientDirection === 'horizontal') {
      gradient = ctx.createLinearGradient(0, 0, width, 0);
    } else if (theme.gradientDirection === 'diagonal') {
      gradient = ctx.createLinearGradient(0, 0, width, height);
    } else {
      gradient = ctx.createLinearGradient(0, 0, 0, height); // Default to vertical
    }
  } else if (theme.gradientType === 'radial') {
    if (theme.gradientDirection === 'from-center') {
      gradient = ctx.createRadialGradient(width / 2, height / 3, 0, width / 2, height, width);
    } else if (theme.gradientDirection === 'top-center') {
      gradient = ctx.createRadialGradient(width / 2, 0, 0, width / 2, height / 2, width);
    } else if (theme.gradientDirection === 'top-to-bottom') {
      gradient = ctx.createRadialGradient(width / 2, 0, 0, width / 2, height, width);
    } else {
      // Default radial gradient
      gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width);
    }
  } else {
    // Default to basic linear gradient if type not specified
    gradient = ctx.createLinearGradient(0, 0, 0, height);
  }

  // Add color stops if available
  if (theme.colorStops && Array.isArray(theme.colorStops) && theme.colorStops.length > 0) {
    theme.colorStops.forEach(stop => {
      gradient.addColorStop(stop.position, stop.color);
    });
  } else {
    // Default color stops if none provided
    gradient.addColorStop(0, TIMBERS_GOLD);
    gradient.addColorStop(1, TIMBERS_GREEN);
  }

  return gradient;
};

/**
 * Create a fallback gradient if the selected theme fails to load
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {CanvasGradient} - The fallback gradient
 */
export const createFallbackGradient = (ctx, width, height) => {
  const classicGradient = ctx.createLinearGradient(0, 0, 0, height);
  classicGradient.addColorStop(0, TIMBERS_GOLD); // Timbers gold
  classicGradient.addColorStop(1, TIMBERS_GREEN); // Timbers green
  return classicGradient;
};

/**
 * Add theme-specific decorative effects
 * @param {string} selectedTheme - The theme name
 * @param {CanvasRenderingContext2D} ctx - The canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {Array} backgroundThemes - Array of background themes from manifest
 */
export const addThemeEffects = (selectedTheme, ctx, width, height, backgroundThemes = []) => {
  // Find theme in array
  const theme = backgroundThemes.find(theme => theme.value === selectedTheme);
  
  // Skip effects for image backgrounds
  if (theme && theme.type === 'image') {
    return;
  }
  
  // Legacy check for static image backgrounds
  if (selectedTheme === 'timber_jim') {
    return;
  }
  
  // Get effect type - use theme.effects if available, otherwise use selectedTheme
  const effectType = theme && theme.effects ? theme.effects : selectedTheme;

  switch (effectType) {
    case 'providence': {
      // Add stadium light flares
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 5; i++) {
        const x = (width / 5) * (i + 0.5);
        const gradSize = width * 0.3;
        const flare = ctx.createRadialGradient(x, 0, 0, x, 0, gradSize);
        flare.addColorStop(0, '#ffffff');
        flare.addColorStop(1, 'transparent');
        ctx.fillStyle = flare;
        ctx.fillRect(x - gradSize/2, 0, gradSize, gradSize);
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'rose': {
      // Add rose pattern effect
      ctx.globalAlpha = 0.15; // Increased from 0.1
      const roseSize = width * 0.15; // Increased from 0.08
      const spacing = roseSize * 1.2; // Adjusted spacing
      const numRows = Math.ceil(height / spacing) + 1;
      const numCols = Math.ceil(width / spacing) + 1;

      // Create rose path once
      const drawRose = (x, y, angle) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(angle);
        
        // Simplified rose path
        ctx.beginPath();
        // Petals
        for (let i = 0; i < 8; i++) {
          const petalAngle = (i * Math.PI * 2) / 8;
          const innerRadius = roseSize * 0.4; // Increased from 0.2
          const outerRadius = roseSize * 0.5; // Increased from 0.4
          
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(
            Math.cos(petalAngle) * innerRadius,
            Math.sin(petalAngle) * innerRadius,
            Math.cos(petalAngle) * outerRadius,
            Math.sin(petalAngle) * outerRadius
          );
        }
        ctx.fillStyle = '#c41e3a'; // Rose red
        ctx.fill();
        
        // Center of rose
        ctx.beginPath();
        ctx.arc(0, 0, roseSize * 0.2, 0, Math.PI * 2); // Increased from 0.15
        ctx.fillStyle = '#8b0000'; // Darker red
        ctx.fill();
        
        ctx.restore();
      };

      // Draw roses in offset grid pattern with more variation
      for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
          const x = col * spacing + (row % 2 ? spacing / 2 : 0);
          const y = row * spacing;
          // Add more random rotation
          const angle = Math.PI / 4 + (Math.sin(x * 0.01 + y * 0.01) * Math.PI / 3);
          drawRose(x, y, angle);
        }
      }

      ctx.globalAlpha = 1;
      break;
    }
    case 'timber': {
      // Add wood grain texture effect
      ctx.globalAlpha = 0.05;
      for (let i = 0; i < 50; i++) {
        const y = Math.random() * height;
        ctx.strokeStyle = '#d69a00';
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.bezierCurveTo(
          width/3, y + Math.random() * 50 - 25,
          width*2/3, y + Math.random() * 50 - 25,
          width, y
        );
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      break;
    }
    case 'night': {
      // Add stars for night theme
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height * 0.6; // Only in upper portion
        const size = Math.random() * 2 + 1;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
      }
      break;
    }
    case 'forest': {
      // Add subtle texture for forest theme
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 100 + 50;
        ctx.fillStyle = '#2d5a3d';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, 2 * Math.PI);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      break;
    }
  }
};
