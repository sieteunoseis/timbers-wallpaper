import React, { useEffect, useRef, useState } from "react";

// Import components
import DeviceSelector from "./components/DeviceSelector";
import PatchSelector from "./components/PatchSelector";
import ThemeSelector from "./components/ThemeSelector";
import TextCustomizer from "./components/TextCustomizer";
import SchedulePreview from "./components/SchedulePreview";
import CanvasPreview from "./components/CanvasPreview";
import WallpaperCanvas from "./components/WallpaperCanvas";
import PositionAdjuster from "./components/PositionAdjuster";
import AccordionPanel from "./components/AccordionPanel";
import { DownloadButton, Instructions, Footer } from "./components/UIComponents";
import useScheduleData from "./hooks/useScheduleData";
import useBackgroundThemes from "./hooks/useBackgroundThemes";
import { usePatchImages } from './hooks/usePatchImages';
import { Paintbrush, Type, Calendar, Phone, MoveVertical, PaintBucket } from "lucide-react";
import { debugLog } from "./utils/debug";
import { captureCanvasToBlob, downloadBlob } from "./utils/downloadUtils";
import { getRandomItem } from "./utils/randomUtils";
import { 
  DEFAULT_PATCH_POSITION_Y, 
  DEFAULT_MATCH_POSITION_Y,
  DEFAULT_TEXT,
  DEFAULT_TEXT_COLOR,
  DEFAULT_FONT_SIZE_MULTIPLIER,
  DEFAULT_IPHONE_MODEL,
  DEFAULT_WALLPAPER_FILENAME,
  IPHONE_MODELS,
  FONT_OPTIONS
} from "./utils/constants";

const TimbersWallpaperGenerator = () => {
  const canvasRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState("");
  // Background themes now come from the hook instead of hardcoded
  const { backgroundThemes, selectedTheme, setSelectedTheme, isLoadingBackgrounds } = useBackgroundThemes();
  const [selectediPhoneSize, setSelectediPhoneSize] = useState(DEFAULT_IPHONE_MODEL);
  const [showPatchImage, setShowPatchImage] = useState(true);
  const [customText, setCustomText] = useState(DEFAULT_TEXT);
  
  // Initialize with a random font from our constant options
  const [selectedFont, setSelectedFont] = useState(() => {
    return getRandomItem(FONT_OPTIONS) || FONT_OPTIONS[0];
  });
  
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(DEFAULT_FONT_SIZE_MULTIPLIER);
  
  // Default text color
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);
  
  // Position adjustments for patch/text and match info
  const [patchPositionY, setPatchPositionY] = useState(DEFAULT_PATCH_POSITION_Y);
  const [matchPositionY, setMatchPositionY] = useState(DEFAULT_MATCH_POSITION_Y);
  
  // Use the new hook for patch images
  const { availableImages, isLoadingImages, loadAvailableImages } = usePatchImages();

  // Load images and set initial background
  useEffect(() => {
    const initializeImages = async () => {
      if (showPatchImage && !selectedBackground) {
        const images = await loadAvailableImages();
        const randomImage = getRandomItem(images);
        if (randomImage) {
          setSelectedBackground(randomImage.value);
          debugLog(`Selected random patch: ${randomImage.label}`);
        }
      }
    };
    
    initializeImages();
  }, [showPatchImage, selectedBackground, loadAvailableImages]); // Updated dependencies

  // Get current iPhone dimensions
  const getCurrentDimensions = () => {
    const selected = IPHONE_MODELS.find((size) => size.value === selectediPhoneSize);
    return selected || IPHONE_MODELS[0];
  };

  // Get schedule data
  const { nextMatches } = useScheduleData();
  
  // Select a random background theme on app load
  useEffect(() => {
    if (backgroundThemes.length > 0 && !isLoadingBackgrounds && !selectedTheme) {
      const randomTheme = getRandomItem(backgroundThemes);
      if (randomTheme) {
        setSelectedTheme(randomTheme.value);
        debugLog(`Selected random theme: ${randomTheme.label}`);
      }
    }
  }, [backgroundThemes, isLoadingBackgrounds, setSelectedTheme, selectedTheme]);

  // Function to generate and download the wallpaper
  const generateWallpaper = async () => {
    try {
      // Get canvas reference
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas not found");
        return;
      }

      try {
        // First capture the canvas image without changing any state
        // This prevents any UI flicker during capture
        const blob = await captureCanvasToBlob(canvas, 'image/png', 1.0);
        
        // Only now show loading indicator (after blob is created)
        setIsGenerating(true);
        
        // Download the blob
        await downloadBlob(blob, DEFAULT_WALLPAPER_FILENAME);
      } catch (error) {
        console.error("Error in wallpaper download process:", error);
      } finally {
        // Always reset generating state when done
        setIsGenerating(false);
      }
    } catch (error) {
      console.error("Error in wallpaper generation:", error);
      setIsGenerating(false);
    }
  };

  // Debug app initialization
  useEffect(() => {
    debugLog('TimbersWallpaperGenerator initialized');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Portland Timbers Schedule Wallpaper</h1>
          <p className="text-green-200 text-lg">Generate your personalized Timbers schedule wallpaper</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* iPhone Mockup */}
          <div className="flex justify-center order-1 lg:order-1">
            <CanvasPreview canvasRef={canvasRef} />

            {/* Canvas for rendering the wallpaper */}
            <WallpaperCanvas 
              canvasRef={canvasRef} 
              selectedBackground={selectedBackground} 
              selectedTheme={selectedTheme} 
              backgroundThemes={backgroundThemes}
              dimensions={getCurrentDimensions()} 
              nextMatches={nextMatches} 
              includeDateTime={false} // Never include date/time in the generated image
              includeMatches={true} 
              showPatchImage={showPatchImage}
              customText={customText}
              selectedFont={selectedFont}
              fontSizeMultiplier={fontSizeMultiplier}
              textColor={textColor}
              patchPositionY={patchPositionY}
              matchPositionY={matchPositionY}
            />
          </div>

          {/* Controls and Info */}
          <div className="space-y-4 order-2 lg:order-2">
            {/* Theme Selector */}
            <AccordionPanel title="Theme" defaultOpen={true} icon={<PaintBucket size={20} />}>
              <ThemeSelector 
                selectedTheme={selectedTheme} 
                setSelectedTheme={setSelectedTheme} 
                themeOptions={backgroundThemes} 
                isLoading={isLoadingBackgrounds} 
              />
            </AccordionPanel>

            {/* Background Image Selector */}
            <AccordionPanel title="Patch Image" defaultOpen={true} icon={<Paintbrush size={20} />}>
              <PatchSelector 
                selectedBackground={selectedBackground} 
                setSelectedBackground={setSelectedBackground} 
                availableImages={availableImages} 
                isLoadingImages={isLoadingImages} 
                loadAvailableImages={loadAvailableImages} 
                showPatchImage={showPatchImage} 
                setShowPatchImage={setShowPatchImage} 
              />
            </AccordionPanel>
            
            {/* Text Customizer */}
            <AccordionPanel title="Text & Font" icon={<Type size={20} />}>
              <TextCustomizer 
                customText={customText} 
                setCustomText={setCustomText}
                selectedFont={selectedFont}
                setSelectedFont={setSelectedFont}
                fontSizeMultiplier={fontSizeMultiplier}
                setFontSizeMultiplier={setFontSizeMultiplier}
                textColor={textColor}
                setTextColor={setTextColor}
              />
            </AccordionPanel>
            
            {/* Position Adjuster */}
            <AccordionPanel title="Position Adjustments" icon={<MoveVertical size={20} />}>
              <PositionAdjuster
                patchPositionY={patchPositionY}
                setPatchPositionY={setPatchPositionY}
                matchPositionY={matchPositionY}
                setMatchPositionY={setMatchPositionY}
              />
            </AccordionPanel>

            {/* Schedule Preview */}
            <AccordionPanel title="Match Schedule" icon={<Calendar size={20} />}>
              <SchedulePreview nextMatches={nextMatches} />
            </AccordionPanel>

            {/* iPhone Size Selector */}
            <AccordionPanel title="Device Size" icon={<Phone size={20} />}>
              <DeviceSelector 
                selectediPhoneSize={selectediPhoneSize} 
                setSelectediPhoneSize={setSelectediPhoneSize} 
                iPhoneSizes={IPHONE_MODELS} 
              />
            </AccordionPanel>

            {/* Download Button - not in an accordion since it should always be visible */}
            <div className="mt-6">
              <DownloadButton 
                canvasRef={canvasRef} 
                isGenerating={isGenerating} 
                setIsGenerating={setIsGenerating} 
                onDownload={generateWallpaper} 
              />
            </div>

            {/* Instructions */}
            <AccordionPanel title="Instructions">
              <Instructions />
            </AccordionPanel>

            {/* Footer */}
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimbersWallpaperGenerator;
