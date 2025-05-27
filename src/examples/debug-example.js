/**
 * Debug Utility Example
 * 
 * This file demonstrates usage of the debug logging utility.
 * It's not used in the actual application but serves as an example.
 */

import { debugLog, debugWarn, debugError, debugInfo, isDebugEnabled } from '../utils/debug';

/**
 * Test function to demonstrate debug utility usage
 */
export const testDebugLogging = () => {
  // First, check if debugging is enabled
  if (isDebugEnabled()) {
    console.log('Debug mode is enabled! You will see all debug messages.');
  } else {
    console.log('Debug mode is disabled. No debug messages will be shown.');
  }

  // These will only appear when VITE_DEBUG_MODE=true
  debugLog('This is a standard debug message');
  debugLog('Message with data:', { userId: 123, action: 'test' });
  
  debugWarn('This is a warning message');
  debugError('This is an error message', new Error('Test error'));
  debugInfo('This is an info message');

  // Example usage in a try/catch
  try {
    // Simulating an error
    throw new Error('Test exception');
  } catch (error) {
    debugError('An error occurred during operation:', error);
  }
  
  return 'Debug examples executed';
};

export default testDebugLogging;
