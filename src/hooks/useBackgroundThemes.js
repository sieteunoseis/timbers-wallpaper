import { useState, useEffect, useCallback } from 'react';
import { debugLog, debugWarn, debugError } from '../utils/debug';

/**
 * Custom hook to fetch and manage backgrounds from manifest
 * @returns {Object} Background data and state
 */
const useBackgroundThemes = () => {
  const [backgroundThemes, setBackgroundThemes] = useState([]);
  const [isLoadingBackgrounds, setIsLoadingBackgrounds] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState("classic");

  // Function to load backgrounds from manifest
  const loadBackgroundThemes = useCallback(async () => {
    setIsLoadingBackgrounds(true);
    const detectedBackgrounds = [];

    try {
      debugLog("Loading backgrounds from manifest...");

      // Try to load the backgrounds manifest file
      const response = await fetch("/background/background-manifest.json");

      if (response.ok) {
        const manifest = await response.json();
        debugLog("Background manifest loaded successfully:", manifest);

        // Validate and process the manifest
        if (manifest.backgrounds && Array.isArray(manifest.backgrounds)) {
          for (const background of manifest.backgrounds) {
            if (background.id && background.label) {
              // For image backgrounds, verify the file exists
              if (background.type === 'image' && background.filename) {
                try {
                  const imageResponse = await fetch(`/background/${background.filename}`, { method: "HEAD" });
                  if (imageResponse.ok) {
                    detectedBackgrounds.push({
                      value: background.id,
                      label: background.label,
                      description: background.description || "",
                      type: background.type,
                      filename: background.filename || "",
                      gradientType: background.gradientType || "",
                      gradientDirection: background.gradientDirection || "",
                      colorStops: background.colorStops || [],
                      effects: background.effects || ""
                    });
                    debugLog(`✓ Found background: ${background.filename}`);
                  } else {
                    debugWarn(`✗ Background image listed in manifest but not found: ${background.filename}`);
                  }
                } catch (error) {
                  debugWarn(`✗ Could not verify background image: ${background.filename}`, error);
                }
              } else {
                // For gradient backgrounds, just add them
                detectedBackgrounds.push({
                  value: background.id,
                  label: background.label,
                  description: background.description || "",
                  type: background.type,
                  filename: background.filename || "",
                  gradientType: background.gradientType || "",
                  gradientDirection: background.gradientDirection || "",
                  colorStops: background.colorStops || [],
                  effects: background.effects || ""
                });
                debugLog(`✓ Added gradient background: ${background.id}`);
              }
            } else {
              debugWarn("Invalid background entry (missing id or label):", background);
            }
          }
        } else {
          debugError("Invalid background manifest format: backgrounds array not found or not an array");
        }

        debugLog(`Successfully loaded ${detectedBackgrounds.length} backgrounds from manifest`);
      } else {
        debugLog("No background-manifest.json found. Using default themes.");
        // Fallback to default themes if file not found
        detectedBackgrounds.push(
          { value: "classic", label: "Classic", description: "Traditional dark gradient", type: "gradient" },
          { value: "forest", label: "Forest", description: "Deep green forest vibes", type: "gradient" },
          { value: "night", label: "Night", description: "Midnight black with stars", type: "gradient" },
          { value: "providence", label: "Providence Park", description: "Stadium lights and atmosphere", type: "gradient" },
          { value: "rose", label: "Rose City", description: "Rose and thorn inspired", type: "gradient" },
          { value: "timber", label: "Timber Joey", description: "Log slab inspired pattern", type: "gradient" },
          { value: "timber_jim", label: "Timber Jim", description: "Static background with Timber Jim", type: "image" }
        );
      }
    } catch (error) {
      debugError("Error loading background manifest:", error);
      // Fall back to defaults on error
      detectedBackgrounds.push(
        { value: "classic", label: "Classic", description: "Traditional dark gradient", type: "gradient" },
        { value: "forest", label: "Forest", description: "Deep green forest vibes", type: "gradient" },
        { value: "night", label: "Night", description: "Midnight black with stars", type: "gradient" },
        { value: "providence", label: "Providence Park", description: "Stadium lights and atmosphere", type: "gradient" },
        { value: "rose", label: "Rose City", description: "Rose and thorn inspired", type: "gradient" },
        { value: "timber", label: "Timber Joey", description: "Log slab inspired pattern", type: "gradient" },
        { value: "timber_jim", label: "Timber Jim", description: "Static background with Timber Jim", type: "image" }
      );
    }

    setBackgroundThemes(detectedBackgrounds);
    setIsLoadingBackgrounds(false);
  }, []);

  // Load backgrounds on mount
  useEffect(() => {
    loadBackgroundThemes();
  }, [loadBackgroundThemes]);

  return {
    backgroundThemes,
    isLoadingBackgrounds,
    selectedTheme,
    setSelectedTheme,
    loadBackgroundThemes
  };
};

export default useBackgroundThemes;
