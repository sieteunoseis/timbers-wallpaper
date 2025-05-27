import { useState, useCallback } from 'react';
import { debugLog, debugWarn } from '../utils/debug';

export const usePatchImages = () => {
  const [availableImages, setAvailableImages] = useState([]);
  const [isLoadingImages, setIsLoadingImages] = useState(true);

  const loadAvailableImages = useCallback(async () => {
    setIsLoadingImages(true);
    const detectedImages = [];

    try {
      debugLog("Loading patches from manifest...");
      // Import the patches manifest from assets folder using Vite's import mechanism
      const manifestUrl = new URL('../assets/patches/patches-manifest.json', import.meta.url).href;
      const response = await fetch(manifestUrl);

      if (response.ok) {
        const manifest = await response.json();
        debugLog("Manifest loaded successfully");

        if (manifest.patches && Array.isArray(manifest.patches)) {
          // In production, trust the manifest and don't verify each image
          detectedImages.push(...manifest.patches.map(patch => ({
            value: patch.filename,
            label: patch.label,
            description: patch.description || "",
            id: patch.id || "",
          })));
        } else {
          debugWarn("Invalid manifest format: patches array not found or not an array");
        }

        debugLog(`Loaded ${detectedImages.length} patches from manifest`);
      } else {
        debugLog("No patches-manifest.json found");
      }
    } catch (error) {
      debugWarn("Error loading patches manifest:", error);
    }

    setAvailableImages(detectedImages);
    setIsLoadingImages(false);
    return detectedImages;
  }, []);

  return {
    availableImages,
    isLoadingImages,
    loadAvailableImages
  };
};
