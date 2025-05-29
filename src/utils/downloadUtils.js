/**
 * Utility functions for handling downloads from canvas
 */

/**
 * Captures a canvas as a blob and returns it, without changing UI state
 * 
 * @param {HTMLCanvasElement} canvas - Canvas element to capture
 * @param {string} type - MIME type for the image (default: image/png)
 * @param {number} quality - Image quality for lossy formats (0-1)
 * @returns {Promise<Blob>} Promise resolving to image blob
 */
export const captureCanvasToBlob = (canvas, type = 'image/png', quality = 1.0) => {
  if (!canvas) {
    return Promise.reject(new Error('Canvas element is null or undefined'));
  }
  
  return new Promise((resolve, reject) => {
    // Use timeout to ensure this happens outside current render cycle
    setTimeout(() => {
      try {
        canvas.toBlob(blob => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, type, quality);
      } catch (err) {
        reject(err);
      }
    }, 0);
  });
};

/**
 * Downloads a blob as a file
 * 
 * @param {Blob} blob - The blob to download
 * @param {string} filename - Filename for the download
 * @returns {Promise<void>} Promise that resolves when download is initiated
 */
export const downloadBlob = (blob, filename) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a blob URL which works better on iOS
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a download link
      const link = document.createElement('a');
      link.download = filename;
      link.href = blobUrl;
      
      // Append, click, and clean up
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Revoke the blob URL after a short delay to ensure download completes
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        resolve();
      }, 100);
    } catch (error) {
      reject(error);
    }
  });
};
