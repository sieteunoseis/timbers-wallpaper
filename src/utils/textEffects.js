/**
 * Utility functions for text rendering and effects
 */

/**
 * Completely clear all shadow and text effects from canvas context
 * @param {CanvasRenderingContext2D} ctx - Canvas context to reset
 */
export const clearTextEffects = (ctx) => {
  if (!ctx) return;
  
  // Don't save/restore because that can preserve states we want to reset
  // Instead, explicitly reset everything we need
  
  // Reset transformation matrix to identity (this is crucial)
  // Try multiple methods with safe fallbacks for different browser implementations
  try {
    if (ctx.setTransform) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else if (ctx.resetTransform) {
      ctx.resetTransform();
    }
    // If neither method is available, we'll just continue without transform reset
  } catch (e) {
    console.warn("Canvas transform methods not supported in this environment");
  }
  
  // Disable shadows completely
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // Reset other properties that could cause ghost effects
  ctx.globalAlpha = 1.0;
  ctx.filter = 'none';
  ctx.globalCompositeOperation = 'source-over';
  
  // Reset text-related properties
  ctx.textAlign = 'start';
  ctx.textBaseline = 'alphabetic';
  ctx.direction = 'ltr';
  ctx.letterSpacing = '0px';
  
  // Reset line properties
  ctx.lineWidth = 1;
  ctx.lineCap = 'butt';
  ctx.lineJoin = 'miter';
  ctx.miterLimit = 10;
};

/**
 * Resets the canvas completely by clearing the entire canvas area
 * Use this when refreshing the entire canvas between renders
 * @param {CanvasRenderingContext2D} ctx - Canvas context to reset
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
export const resetCanvas = (ctx, width, height) => {
  if (!ctx) return;
  
  // Validate that we have a proper canvas context with required methods
  if (typeof ctx.clearRect !== 'function' || typeof ctx.fillRect !== 'function') {
    console.warn("Invalid canvas context - missing required methods");
    return;
  }
  
  // Reset transformation matrix to identity (this must come first)
  // Try multiple methods with safe fallbacks for different browser implementations
  try {
    if (ctx.setTransform) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    } else if (ctx.resetTransform) {
      ctx.resetTransform();
    }
    // If neither method is available, we'll just continue without transform reset
  } catch (e) {
    console.warn("Canvas transform methods not supported in this environment");
  }
  
  // Clear the entire canvas with clearRect (removes all content)
  try {
    ctx.clearRect(0, 0, width, height);
  } catch (e) {
    console.warn("clearRect failed, trying alternative clearing method");
    // Fallback clearing method
    try {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
    } catch (fallbackError) {
      console.error("All canvas clearing methods failed");
      return;
    }
  }
  
  // Use a double clearing approach - sometimes helps with stubborn artifacts
  // First with transparent black
  ctx.fillStyle = 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, width, height);
  
  // Then with fully transparent fill (helps flush graphics buffer)
  ctx.globalAlpha = 0;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;
  
  // Reset all context properties to defaults
  clearTextEffects(ctx);
  
  // Reset any paths that might be in progress
  ctx.beginPath();
  ctx.closePath();
};
