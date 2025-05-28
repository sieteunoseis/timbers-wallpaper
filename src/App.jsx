import React, { useEffect, useRef, useState } from "react";

// Import components
import DeviceSelector from "./components/DeviceSelector";
import PatchSelector from "./components/PatchSelector";
import ThemeSelector from "./components/ThemeSelector";
import TextCustomizer from "./components/TextCustomizer";
import SchedulePreview from "./components/SchedulePreview";
import CanvasPreview from "./components/CanvasPreview";
import WallpaperCanvas from "./components/WallpaperCanvas";
import { DownloadButton, Instructions, Footer } from "./components/UIComponents";
import useScheduleData from "./hooks/useScheduleData";
import useBackgroundThemes from "./hooks/useBackgroundThemes";
import { usePatchImages } from './hooks/usePatchImages';

const TimbersWallpaperGenerator = () => {
  const canvasRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedBackground, setSelectedBackground] = useState("");
  // Background themes now come from the hook instead of hardcoded
  const { backgroundThemes, selectedTheme, setSelectedTheme, isLoadingBackgrounds } = useBackgroundThemes();
  const [selectediPhoneSize, setSelectediPhoneSize] = useState("iphone15");
  const [showPatchImage, setShowPatchImage] = useState(true);
  const [customText, setCustomText] = useState("PORTLAND TIMBERS");
  
  // Available font options - should match those in TextCustomizer.jsx
  const fontOptions = [
    "Another Danger",
    "Rose",
    "Urban Jungle",
    "Avenir",
    "Verdana",
    "Lethal Slime"
  ];
  
  // Initialize with a random font instead of hardcoding
  const [selectedFont, setSelectedFont] = useState(() => {
    const randomIndex = Math.floor(Math.random() * fontOptions.length);
    return fontOptions[randomIndex];
  });
  
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0);
  
  // Use the new hook for patch images
  const { availableImages, isLoadingImages, loadAvailableImages } = usePatchImages();

  // Load images and set initial background
  useEffect(() => {
    const initializeImages = async () => {
      if (showPatchImage) {
        const images = await loadAvailableImages();
        if (images.length > 0 && !selectedBackground) {
          const randomIndex = Math.floor(Math.random() * images.length);
          setSelectedBackground(images[randomIndex].value);
        }
      }
    };
    
    initializeImages();
  }, [showPatchImage, loadAvailableImages, selectedBackground]);

  // iPhone size options including iPhone 16 series
  const iPhoneSizes = [
    { value: "iphone16promax", label: "iPhone 16 Pro Max", width: 1290, height: 2796 },
    { value: "iphone16pro", label: "iPhone 16 Pro", width: 1179, height: 2556 },
    { value: "iphone15", label: "iPhone 15/15 Pro", width: 1179, height: 2556 },
    { value: "iphone15plus", label: "iPhone 15 Plus/Pro Max", width: 1290, height: 2796 },
    { value: "custom", label: "Custom (1080x2337)", width: 1080, height: 2337 },
  ];

  // Get current iPhone dimensions
  const getCurrentDimensions = () => {
    const selected = iPhoneSizes.find((size) => size.value === selectediPhoneSize);
    return selected || iPhoneSizes[0];
  };

  // Get schedule data
  const { nextMatches } = useScheduleData();
  
  // Select a random background theme on app load
  useEffect(() => {
    if (backgroundThemes.length > 0 && !isLoadingBackgrounds) {
      const randomIndex = Math.floor(Math.random() * backgroundThemes.length);
      setSelectedTheme(backgroundThemes[randomIndex].value);
    }
  }, [backgroundThemes, isLoadingBackgrounds]);

  // Function to generate and download the wallpaper
  const generateWallpaper = async () => {
    setIsGenerating(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas not found");
        return;
      }

      // To ensure match overlays are present during download, we need a small delay
      // to allow the canvas to fully render with all elements
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // For iOS Safari compatibility, use blob instead of dataURL
      canvas.toBlob(async (blob) => {
        if (!blob) {
          console.error("Failed to create blob from canvas");
          setIsGenerating(false);
          return;
        }
        
        try {
          // Create a blob URL which works better on iOS
          const blobUrl = URL.createObjectURL(blob);
          
          // Create a download link
          const link = document.createElement("a");
          link.download = "timbers-wallpaper.png";
          link.href = blobUrl;
          
          // Append, click, and clean up
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Revoke the blob URL after a short delay to ensure download completes
          setTimeout(() => URL.revokeObjectURL(blobUrl), 300);
          
          setIsGenerating(false);
        } catch (error) {
          console.error("Error in blob download:", error);
          setIsGenerating(false);
        }
      }, "image/png");
    } catch (error) {
      console.error("Error generating wallpaper:", error);
      setIsGenerating(false);
    }
  };

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
              includeDateTime={!isGenerating} 
              includeMatches={true} 
              showPatchImage={showPatchImage}
              customText={customText}
              selectedFont={selectedFont}
              fontSizeMultiplier={fontSizeMultiplier}
            />
          </div>

          {/* Controls and Info */}
          <div className="space-y-6 order-2 lg:order-2">
                        {/* Theme Selector */}
            <ThemeSelector 
              selectedTheme={selectedTheme} 
              setSelectedTheme={setSelectedTheme} 
              themeOptions={backgroundThemes} 
              isLoading={isLoadingBackgrounds} 
            />

            {/* Background Image Selector */}
            <PatchSelector selectedBackground={selectedBackground} setSelectedBackground={setSelectedBackground} availableImages={availableImages} isLoadingImages={isLoadingImages} loadAvailableImages={loadAvailableImages} showPatchImage={showPatchImage} setShowPatchImage={setShowPatchImage} />
            
            {/* Text Customizer */}
            <TextCustomizer 
              customText={customText} 
              setCustomText={setCustomText}
              selectedFont={selectedFont}
              setSelectedFont={setSelectedFont}
              fontSizeMultiplier={fontSizeMultiplier}
              setFontSizeMultiplier={setFontSizeMultiplier}
            />

            {/* Schedule Preview */}
            <SchedulePreview nextMatches={nextMatches} />

			{/* iPhone Size Selector */}
            <DeviceSelector selectediPhoneSize={selectediPhoneSize} setSelectediPhoneSize={setSelectediPhoneSize} iPhoneSizes={iPhoneSizes} />


            {/* Download Button */}
            <DownloadButton canvasRef={canvasRef} isGenerating={isGenerating} setIsGenerating={setIsGenerating} onDownload={generateWallpaper} />

            {/* Instructions */}
            <Instructions />

            {/* Footer */}
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimbersWallpaperGenerator;
