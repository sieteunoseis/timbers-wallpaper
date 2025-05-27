/**
 * Debug logging utility for the Timbers Wallpaper Generator application.
 * Only logs messages when the VITE_DEBUG_MODE environment variable is set to 'true'.
 * 
 * @module debug
 */

/**
 * Checks if debug mode is enabled via environment variable
 * 
 * @returns {boolean} Whether debug mode is enabled
 */
export const isDebugEnabled = () => {
  return import.meta.env.VITE_DEBUG_MODE === 'true';
};

/**
 * Log debug messages when debug mode is enabled
 * 
 * @param {string} message - The message to log
 * @param {any} [data] - Optional data to log
 * @param {string} [type='log'] - Log type: 'log', 'warn', 'error', or 'info'
 */
export const debugLog = (message, data, type = 'log') => {
  if (!isDebugEnabled()) return;
  
  const types = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
  };

  const logFn = types[type] || console.log;

  if (data !== undefined) {
    logFn(`[DEBUG] ${message}`, data);
  } else {
    logFn(`[DEBUG] ${message}`);
  }
};

/**
 * Log warning messages when debug mode is enabled
 * 
 * @param {string} message - The warning message
 * @param {any} [data] - Optional data to log
 */
export const debugWarn = (message, data) => {
  debugLog(message, data, 'warn');
};

/**
 * Log error messages when debug mode is enabled
 * 
 * @param {string} message - The error message
 * @param {any} [data] - Optional data to log
 */
export const debugError = (message, data) => {
  debugLog(message, data, 'error');
};

/**
 * Log info messages when debug mode is enabled
 * 
 * @param {string} message - The info message
 * @param {any} [data] - Optional data to log
 */
export const debugInfo = (message, data) => {
  debugLog(message, data, 'info');
};

export default debugLog;
