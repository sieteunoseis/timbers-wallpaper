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
  const [selectedFont, setSelectedFont] = useState("Another Danger");
  const [fontSizeMultiplier, setFontSizeMultiplier] = useState(1.0);
  
  // Use the new hook for patch images
  const { availableImages, isLoadingImages, loadAvailableImages } = usePatchImages();

  // Helper function to prepare canvas for screenshot (iOS support)
  const prepareCanvasForScreenshot = () => {
    // Ensure canvas is fully rendered with high quality
    const canvas = canvasRef.current;
    if (canvas) {
      // Force a high-quality render for screenshot by temporarily increasing size
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Store current image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Apply a subtle border to make the wallpaper edges more visible in screenshots
        // This helps users see where to crop
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 8;
        ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);
        
        // Restore image data after brief timeout to ensure it's visible
        setTimeout(() => {
          // Only restore if still generating (user hasn't cancelled)
          if (isGenerating) {
            ctx.putImageData(imageData, 0, 0);
          }
        }, 500);
      }
    }
  };
  
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

  // Function to generate and download the wallpaper
  const generateWallpaper = async () => {
    setIsGenerating(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas not found");
        return;
      }

      // Wait for the next render cycle to ensure the canvas is updated
      // when isGenerating becomes true
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // More robust iOS detection
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const isIOSBrowser = isIOS || (isSafari && isIOS);
      
      // Check if we have an image background that might cause CORS issues
      const hasImageBackground = backgroundThemes.some(theme => 
        theme.value === selectedTheme && theme.type === 'image'
      );
      
      // For iOS with image backgrounds ONLY, show screenshot instructions
      // This is needed because image backgrounds can cause CORS issues on iOS
      if (isIOSBrowser && hasImageBackground) {
        // Optimize the canvas for screenshot
        prepareCanvasForScreenshot();
        
        // Show enhanced instructions for iOS users with image backgrounds
        const screenshotMsg = "For image backgrounds on iPhone, download isn't available due to iOS restrictions.\n\n" +
          "Please save this wallpaper by taking a screenshot:\n" +
          "1. Press side button + volume up\n" +
          "2. Crop the image to remove browser elements\n" +
          "3. Save to your photos\n\n" +
          "Note: Using gradient backgrounds instead of images allows direct downloads.";
        
        alert(screenshotMsg);
        
        // Scroll to and focus the preview
        const previewElement = document.querySelector('.canvas-preview-container');
        if (previewElement) {
          previewElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          // Add a subtle highlight effect to show users where to screenshot
          previewElement.classList.add('screenshot-ready');
          setTimeout(() => {
            previewElement.classList.remove('screenshot-ready');
          }, 3000);
        }
      } else {
        try {
          // Standard download approach for non-iOS or non-image backgrounds
          const dataUrl = canvas.toDataURL("image/png");
          const link = document.createElement("a");
          link.download = "timbers-wallpaper.png";
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (securityError) {
          console.warn("Canvas security error (likely due to CORS):", securityError);
          
          // Fallback for unexpected security errors
          if (isIOSBrowser) {
            // Check if this is likely due to an image background
            if (hasImageBackground) {
              alert("This image background can't be downloaded directly on iOS. Please take a screenshot or switch to a gradient background theme instead.");
            } else {
              // Standard error for non-image backgrounds - no screenshot instructions
              alert("There was an issue downloading the wallpaper. Please try again or use a different background theme.");
            }
            
            // Only scroll to preview for screenshot if using image backgrounds
            if (hasImageBackground) {
              const previewElement = document.querySelector('.canvas-preview-container');
              if (previewElement) {
                previewElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }
          } else {
            // For non-iOS browsers, show a more specific error
            alert("Unable to download the wallpaper due to security restrictions. Try using a gradient background theme instead of an image.");
          }
        }
      } 
    } catch (error) {
      console.error("Error generating wallpaper:", error);
      
      // Provide more specific error messaging based on the device/browser and background type
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      // Re-check if we have an image background 
      const hasImgBackground = backgroundThemes.some(theme => 
        theme.value === selectedTheme && theme.type === 'image'
      );
      
      if (isIOS && hasImgBackground) {
        alert("There was an issue creating your wallpaper. Please try taking a screenshot of the preview instead.");
        
        // Only show the preview for screenshot with image backgrounds
        const previewElement = document.querySelector('.canvas-preview-container');
        if (previewElement) {
          previewElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        alert("Failed to generate wallpaper. Please try again with a different theme or patch.");
      }
    } finally {
      // Wait a moment before removing the generating state
      // This ensures iOS users have time to see and take the screenshot for image backgrounds
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      const needsScreenshot = backgroundThemes.some(theme => 
        theme.value === selectedTheme && theme.type === 'image'
      );
      
      if (isIOS && needsScreenshot) {
        // Delay ending the generating state on iOS with image backgrounds to allow time for screenshots
        setTimeout(() => {
          setIsGenerating(false);
        }, 1500);
      } else {
        setIsGenerating(false);
      }
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
              includeDateTime={true} 
              showPatchImage={showPatchImage}
              customText={customText}
              selectedFont={selectedFont}
              fontSizeMultiplier={fontSizeMultiplier}
            />
          </div>

          {/* Controls and Info */}
          <div className="space-y-6 order-2 lg:order-2">
            {/* Background Image Selector */}
            <PatchSelector selectedBackground={selectedBackground} setSelectedBackground={setSelectedBackground} availableImages={availableImages} isLoadingImages={isLoadingImages} loadAvailableImages={loadAvailableImages} showPatchImage={showPatchImage} setShowPatchImage={setShowPatchImage} />

            {/* Theme Selector */}
            <ThemeSelector 
              selectedTheme={selectedTheme} 
              setSelectedTheme={setSelectedTheme} 
              themeOptions={backgroundThemes} 
              isLoading={isLoadingBackgrounds} 
            />
            
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
