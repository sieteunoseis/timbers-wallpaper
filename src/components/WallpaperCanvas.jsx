import React, { useEffect, useCallback } from 'react';
import { tryLoadImage, createFallbackLogo } from '../utils/imageLoader';
import { drawDateAndTime } from '../utils/dateFormatters';
import { getThemeBackground, addThemeEffects, createFallbackGradient, TIMBERS_GREEN, TIMBERS_GOLD, TIMBERS_WHITE } from '../utils/backgroundRenderers';
import { clearTextEffects, resetCanvas } from '../utils/textEffects';
import { debugLog, debugWarn } from '../utils/debug';

/**
 * Component responsible for rendering the wallpaper on canvas
 * 
 * @param {Object} props - Component props
 * @param {React.RefObject} props.canvasRef - Reference to the canvas element
 * @param {string} props.selectedBackground - Selected patch image
 * @param {string} props.selectedTheme - Selected theme
 * @param {Array} props.backgroundThemes - Available background themes from manifest
 * @param {Object} props.dimensions - Current device dimensions
 * @param {Array} props.nextMatches - Array of upcoming matches
 * @param {boolean} props.includeDateTime - Whether to include date/time on the wallpaper
 * @param {boolean} props.showPatchImage - Whether to show the patch image
 * @param {string} props.customText - Custom text to display instead of "PORTLAND TIMBERS"
 * @param {string} props.selectedFont - Font family to use for the custom text. 
 *                                      Available options: "Another Danger" (caps only), "Avenir", "Verdana" (bold), "Rose", "Urban Jungle" or "Lethal Slime" (caps only)
 * @param {number} props.fontSizeMultiplier - Multiplier for font size (1.0 is default)
 * @returns {null} This component doesn't render UI elements directly
 */
const WallpaperCanvas = ({ 
  canvasRef, 
  selectedBackground, 
  selectedTheme, 
  backgroundThemes = [], 
  dimensions, 
  nextMatches, 
  includeDateTime = true,
  showPatchImage = true,
  customText = "PORTLAND TIMBERS",
  selectedFont = "Arial",
  fontSizeMultiplier = 1.0
}) => {
  const generateWallpaper = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get a fresh context with alpha false - helps with clearing
    const ctx = canvas.getContext('2d', { alpha: false });
    const width = dimensions.width;
    const height = dimensions.height;

    // Force a complete canvas reset by resizing
    canvas.width = 1;  // First set to minimal size
    canvas.height = 1;
    canvas.width = width;  // Then set to desired dimensions
    canvas.height = height;
    
    // Apply our thorough canvas reset utility
    resetCanvas(ctx, width, height);
    
    // Ensure the transformation matrix is set to identity
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    
    // Fill with black to start fresh
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    resetCanvas(ctx, width, height);

    // Create themed background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Apply theme-specific background
    const themeBackground = await getThemeBackground(selectedTheme, ctx, width, height, backgroundThemes);
    if (themeBackground instanceof HTMLImageElement) {
      try {
        // Handle static image background (Timber Jim)
        // Scale and center the image to cover the entire canvas
        const imgAspect = themeBackground.width / themeBackground.height;
        const canvasAspect = width / height;
        
        let drawWidth, drawHeight, drawX, drawY;
        
        if (imgAspect > canvasAspect) {
          // Image is wider than canvas aspect ratio
          drawHeight = height;
          drawWidth = height * imgAspect;
          drawX = (width - drawWidth) / 2;
          drawY = 0;
        } else {
          // Image is taller than canvas aspect ratio
          drawWidth = width;
          drawHeight = width / imgAspect;
          drawX = 0;
          drawY = (height - drawHeight) / 2;
        }
        
        // Draw the image using a more cautious approach for iOS
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, width, height);
        ctx.clip();
        ctx.drawImage(themeBackground, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();
        
        // Add a subtle dark overlay to ensure text readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(0, 0, width, height);
        
        debugLog('Successfully drew image background');
      } catch (error) {
        // In case of drawing error, fall back to a gradient
        debugWarn('Error drawing image background:', error);
        ctx.fillStyle = createFallbackGradient(ctx, width, height);
        ctx.fillRect(0, 0, width, height);
      }
    } else {
      // Handle gradient background
      ctx.fillStyle = themeBackground;
      ctx.fillRect(0, 0, width, height);
    }

    // Add theme-specific effects
    addThemeEffects(selectedTheme, ctx, width, height, backgroundThemes);

    // Draw central image area - Moved much lower towards bottom
    const logoY = Math.floor(height * 0.4); // 40% down from top
    const circleRadius = Math.floor(Math.min(width, height) * 0.2);

    // Load and draw the selected image in the circular area if enabled
    if (showPatchImage && selectedBackground) {
      try {
        // Import patch from assets instead of public folder
        const patchImgPath = new URL(`../assets/patches/${selectedBackground}`, import.meta.url).href;
        const selectedImg = await tryLoadImage(patchImgPath);
        debugLog('Selected image loaded successfully');

        // Create circular clipping path for the selected image
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, logoY, circleRadius, 0, 2 * Math.PI);
        ctx.clip();

        // Calculate dimensions to fit image in circle while maintaining aspect ratio
        const scaleFactor = 1.0; // Adjust this value between 0 and 1 to scale the image
        const imgAspect = selectedImg.width / selectedImg.height;
        const circleSize = circleRadius * 2;
        const scaledCircleSize = circleSize * scaleFactor;

        let imgWidth, imgHeight, imgX, imgY;

        if (imgAspect > 1) {
          // Image is wider than tall
          imgWidth = scaledCircleSize;
          imgHeight = scaledCircleSize / imgAspect;
          imgX = width / 2 - (scaledCircleSize / 2);
          imgY = logoY - imgHeight / 2;
        } else {
          // Image is taller than wide
          imgHeight = scaledCircleSize;
          imgWidth = scaledCircleSize * imgAspect;
          imgX = width / 2 - imgWidth / 2;
          imgY = logoY - (scaledCircleSize / 2);
        }

        // Draw the image
        ctx.drawImage(selectedImg, imgX, imgY, imgWidth, imgHeight);
        ctx.restore();

        // Add a subtle border around the circular image
        ctx.beginPath();
        ctx.arc(width / 2, logoY, circleRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = TIMBERS_GOLD;
        ctx.lineWidth = 4;
        ctx.stroke();
      } catch (error) {
        debugWarn('Failed to load selected image:', error);
        // Don't draw anything if loading fails
      }
    }
    // No else block - we don't draw anything if the patch image is disabled

    // Custom text - clear all previous effects first
    clearTextEffects(ctx);
    
    ctx.fillStyle = TIMBERS_WHITE;
    
    // Set font size and weight based on selected font
    let fontSize, fontWeight;
    
    if (selectedFont === 'Lethal Slime') {
      // Special handling for Lethal Slime font - keeping original sizes
      fontWeight = 'normal';
      
      // More aggressive scaling for Lethal Slime since it's wider
      if (customText.length <= 8) {
        fontSize = 60; // Very short text can be larger
      } else if (customText.length <= 12) {
        fontSize = 50;
      } else if (customText.length <= 16) {
        fontSize = 44;
      } else if (customText.length <= 20) {
        fontSize = 38;
      } else if (customText.length <= 25) {
        fontSize = 32;
      } else if (customText.length <= 30) {
        fontSize = 28;
      } else {
        fontSize = 24; // Very small for long text
      }
      
      // Apply font size multiplier
      fontSize = Math.round(fontSize * fontSizeMultiplier);
    } else if (selectedFont === 'Another Danger') {
      // Special handling for Another Danger font
      fontWeight = 'normal';
      
      // Increased scaling for Another Danger
      if (customText.length <= 8) {
        fontSize = 75; // Very short text can be larger
      } else if (customText.length <= 12) {
        fontSize = 65;
      } else if (customText.length <= 16) {
        fontSize = 58;
      } else if (customText.length <= 20) {
        fontSize = 52;
      } else if (customText.length <= 25) {
        fontSize = 46;
      } else if (customText.length <= 30) {
        fontSize = 42;
      } else {
        fontSize = 38; // Very small for long text
      }
      
      // Apply font size multiplier
      fontSize = Math.round(fontSize * fontSizeMultiplier);
    } else if (selectedFont === 'Rose') {
      // Special handling for Rose font
      fontWeight = 'normal';
      
      // Increased scaling for Rose font
      if (customText.length <= 8) {
        fontSize = 78; // Very short text can be larger
      } else if (customText.length <= 12) {
        fontSize = 72;
      } else if (customText.length <= 16) {
        fontSize = 66;
      } else if (customText.length <= 20) {
        fontSize = 60;
      } else if (customText.length <= 25) {
        fontSize = 54;
      } else if (customText.length <= 30) {
        fontSize = 50;
      } else {
        fontSize = 46; // Very small for long text
      }
      
      // Apply font size multiplier
      fontSize = Math.round(fontSize * fontSizeMultiplier);
    } else if (selectedFont === 'Urban Jungle') {
      // Special handling for Urban Jungle font
      fontWeight = 'normal';
      
      // Increased scaling for Urban Jungle
      if (customText.length <= 8) {
        fontSize = 82; // Very short text can be larger
      } else if (customText.length <= 12) {
        fontSize = 74;
      } else if (customText.length <= 16) {
        fontSize = 68;
      } else if (customText.length <= 20) {
        fontSize = 62;
      } else if (customText.length <= 25) {
        fontSize = 56;
      } else if (customText.length <= 30) {
        fontSize = 52;
      } else {
        fontSize = 48; // Very small for long text
      }
      
      // Apply font size multiplier
      fontSize = Math.round(fontSize * fontSizeMultiplier);
    } else {
      // Normal handling for system fonts - increased sizes
      fontWeight = ['Verdana'].includes(selectedFont) ? 'bold' : 'normal';
      fontSize = 68; // Increased from 58
      if (customText.length > 30) {
        fontSize = 62; // Increased from 52
      }
      if (customText.length > 40) {
        fontSize = 58; // Increased from 48
      }
      
      // Apply font size multiplier
      fontSize = Math.round(fontSize * fontSizeMultiplier);
    }
    
    // Use the font
    const fallbackFonts = ['Lethal Slime', 'Another Danger', 'Rose', 'Urban Jungle'].includes(selectedFont) ? '' : ', sans-serif';
    ctx.font = `${fontWeight} ${fontSize}px "${selectedFont}"${fallbackFonts}`;
    ctx.textAlign = 'center';
    
    // Adjust text position if no patch image is shown
    const textY = showPatchImage ? logoY + 380 : logoY + 100;
    
    // Ensure text doesn't get too long and wrap
    let displayText = customText.length > 50 ? customText.substring(0, 50) : customText;
    
    // Ensure caps-only fonts are always uppercase
    if (['Lethal Slime', 'Another Danger', 'Rose', 'Urban Jungle'].includes(selectedFont)) {
      displayText = displayText.toUpperCase();
      
      // Apply letter spacing if needed
      if (selectedFont === 'Another Danger') {
        ctx.letterSpacing = '4px';
      } else {
        ctx.letterSpacing = '2px';
      }
    } else {
      ctx.letterSpacing = '0px';
    }
    
    // Before adding any text effects, make sure we have a clean slate
    clearTextEffects(ctx);
    
    // Setup text properties
    ctx.textAlign = 'center';
    ctx.fillStyle = TIMBERS_WHITE;
    
    // Add text shadow for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Add subtle gold border around text for extra pop against dark backgrounds
    if (selectedTheme === 'night' || selectedTheme === 'forest') {
      ctx.strokeStyle = TIMBERS_GOLD;
      ctx.lineWidth = 1;
      ctx.strokeText(displayText, width / 2, textY);
    }
    
    // Draw the text
    ctx.fillText(displayText, width / 2, textY);
    
    // Immediately reset shadow and other text effects
    clearTextEffects(ctx);

    // Include date/time if requested
    if (includeDateTime) {
      drawDateAndTime(ctx, width, logoY, circleRadius);
    }

    // Schedule section - Vertical layout below content
    // Adjust schedule position if no patch image is shown
    const scheduleStartY = showPatchImage ? logoY + 540 : logoY + 340;

    // Load Portland Timbers logo with fallback
    let timbersLogo;
    const timbersLogoUrl = 'https://cdn.sportmonks.com/images/soccer/teams/31/607.png';
    try {
      timbersLogo = await tryLoadImage(timbersLogoUrl);
      debugLog('Timbers logo loaded successfully');
    } catch (error) {
      debugWarn('Failed to load Timbers logo, using fallback:', error);
      timbersLogo = createFallbackLogo('POR', true);
    }

    // Draw each match with team logos
    const matchSpacing = Math.floor(height * 0.085); // Tight spacing
    const logoSize = Math.floor(width * 0.095); // Size of team logos
    const logoSpacing = Math.floor(width * 0.095); // Spacing between logos

    for (let i = 0; i < Math.min(nextMatches.length, 4); i++) {
      const match = nextMatches[i];
      const matchY = scheduleStartY + i * matchSpacing;
      const centerX = width / 2;

      // Create background rectangle for each match
      const matchBgPadding = Math.floor(width * 0.037);
      const matchBgHeight = Math.floor(matchSpacing * 0.75);
      const matchBgY = matchY - matchBgHeight / 2;
      const cornerRadius = Math.floor(matchBgHeight * 0.25); // Rounded corners

      // Fill rounded rectangle background
      ctx.fillStyle = 'rgba(0, 66, 37, 0.3)';
      ctx.beginPath();
      ctx.roundRect(
        matchBgPadding,
        matchBgY,
        width - matchBgPadding * 2,
        matchBgHeight,
        cornerRadius
      );
      ctx.fill();

      // Add border with rounded corners - gold for home, green for away
      ctx.strokeStyle = match.isHome ? 'rgba(214, 175, 59, 0.7)' : 'rgba(255, 255, 255, 0.7)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(
        matchBgPadding,
        matchBgY,
        width - matchBgPadding * 2,
        matchBgHeight,
        cornerRadius
      );
      ctx.stroke();

      // Draw Portland Timbers logo (left side)
      if (timbersLogo) {
        ctx.fillStyle = TIMBERS_WHITE;
        ctx.beginPath();
        ctx.arc(centerX - logoSpacing, matchY, logoSize / 2 + 8, 0, 2 * Math.PI);
        ctx.fill();

        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX - logoSpacing, matchY, logoSize / 2, 0, 2 * Math.PI);
        ctx.clip();

        if (timbersLogo instanceof HTMLCanvasElement) {
          ctx.drawImage(timbersLogo, centerX - logoSpacing - logoSize / 2, matchY - logoSize / 2, logoSize, logoSize);
        } else {
          ctx.drawImage(timbersLogo, centerX - logoSpacing - logoSize / 2, matchY - logoSize / 2, logoSize, logoSize);
        }
        ctx.restore();
      }

      // Load and draw opponent logo
      let opponentLogo;
      if (match.logoUrl) {
        try {
          opponentLogo = await tryLoadImage(match.logoUrl);
        } catch {
          opponentLogo = createFallbackLogo(match.opponentShort);
        }
      } else {
        opponentLogo = createFallbackLogo(match.opponentShort);
      }

      ctx.fillStyle = TIMBERS_WHITE;
      ctx.beginPath();
      ctx.arc(centerX + logoSpacing, matchY, logoSize / 2 + 8, 0, 2 * Math.PI);
      ctx.fill();

      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX + logoSpacing, matchY, logoSize / 2, 0, 2 * Math.PI);
      ctx.clip();

      if (opponentLogo instanceof HTMLCanvasElement) {
        ctx.drawImage(opponentLogo, centerX + logoSpacing - logoSize / 2, matchY - logoSize / 2, logoSize, logoSize);
      } else {
        ctx.drawImage(opponentLogo, centerX + logoSpacing - logoSize / 2, matchY - logoSize / 2, logoSize, logoSize);
      }
      ctx.restore();

      // VS or @ text (center)
      // Clear any shadows before drawing VS/@
      clearTextEffects(ctx);
      
      ctx.fillStyle = TIMBERS_GOLD;
      const vsFont = Math.floor(width * 0.026);
      ctx.font = `bold ${vsFont}px "Avenir Next"`;
      ctx.textAlign = 'center';
      ctx.fillText(match.isHome ? 'VS' : '@', centerX, matchY + 8);

      // Match date and time on the right side of logos
      const dateTimeX = centerX + logoSpacing + logoSize / 2 + Math.floor(width * 0.046);

      // Match date
      // Clear any shadows before drawing match date
      clearTextEffects(ctx);
      
      ctx.fillStyle = TIMBERS_WHITE;
      const matchDateFont = Math.floor(width * 0.026);
      ctx.font = `bold ${matchDateFont}px "Avenir Next"`;
      ctx.textAlign = 'left';
      
      let formattedDate = 'TBD';
      if (match.date) {
        try {
          // Handle date in a cross-browser compatible way
          // Format: YYYY-MM-DD HH:MM:SS or YYYY-MM-DD
          const parts = match.date.split(' ');
          const dateParts = parts[0].split('-');
          
          // Create date using individual components (year, month-1, day)
          // This approach is more compatible across browsers
          const matchDate = new Date(Date.UTC(
            parseInt(dateParts[0], 10),  // year
            parseInt(dateParts[1], 10) - 1,  // month (0-based)
            parseInt(dateParts[2], 10)   // day
          ));
          
          formattedDate = matchDate.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            timeZone: 'America/Los_Angeles',
          });
        } catch (e) {
          console.error('Error formatting match date:', e);
          formattedDate = 'TBD';
        }
      }
      
      ctx.fillText(formattedDate.replace(',', ''), dateTimeX, matchY - 20);

      // Match time below date
      // Clear any shadows before drawing match time
      clearTextEffects(ctx);
      
      ctx.fillStyle = TIMBERS_GOLD;
      const matchTimeFont = Math.floor(width * 0.024);
      ctx.font = `${matchTimeFont}px "Avenir Next"`;
      ctx.textAlign = 'left';
      
      let timeText = 'TBD';
      if (match.time) {
        try {
          // Handle time in a cross-browser compatible way
          // Format: YYYY-MM-DD HH:MM:SS
          const parts = match.time.split(' ');
          
          if (parts.length >= 2) {
            // Has time components
            const dateParts = parts[0].split('-');
            const timeParts = parts[1].split(':');
            
            // Create date using individual components
            const matchDateTime = new Date(Date.UTC(
              parseInt(dateParts[0], 10),  // year
              parseInt(dateParts[1], 10) - 1,  // month (0-based)
              parseInt(dateParts[2], 10),  // day
              parseInt(timeParts[0], 10),  // hour
              parseInt(timeParts[1], 10),  // minute
              parseInt(timeParts[2] || 0, 10)  // second (default to 0)
            ));
            
            timeText = matchDateTime.toLocaleTimeString('en-US', {
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
              timeZone: 'America/Los_Angeles',
            });
          }
        } catch (e) {
          console.error('Error formatting match time:', e);
          timeText = 'TBD';
        }
      }
      
      ctx.fillText(timeText, dateTimeX, matchY + 15);
      
      // Add home/away status below time
      // Clear any shadows before drawing status
      clearTextEffects(ctx);
      
      const statusFont = Math.floor(width * 0.024);
      ctx.font = `${statusFont}px "Avenir Next"`;
      ctx.fillStyle = match.isHome ? 'rgba(214, 175, 59, 0.9)' : 'rgba(252, 253, 253, 0.9)';
      const statusText = match.isHome ? 'HOME' : 'AWAY';
      ctx.fillText(statusText, dateTimeX, matchY + 50);
    }



    // Footer
    ctx.fillStyle = TIMBERS_WHITE;
    
    // Set footer font to match selected font
    const footerFontSize = Math.round(24 * fontSizeMultiplier);
    const footerFallbackFonts = ['Lethal Slime', 'Another Danger', 'Rose', 'Urban Jungle'].includes(selectedFont) ? '' : ', sans-serif';
    const footerFontWeight = ['Verdana'].includes(selectedFont) ? 'bold' : 'normal';
    ctx.font = `${footerFontWeight} ${footerFontSize}px "${selectedFont}"${footerFallbackFonts}`;
    
    // Handle special fonts for the footer text
    let footerText = 'Rose City Till I Die! 🌹⚽';
    
    // Ensure caps-only fonts are always uppercase
    if (['Lethal Slime', 'Another Danger', 'Rose', 'Urban Jungle'].includes(selectedFont)) {
      footerText = footerText.toUpperCase();
    }
    
    // Clear all shadow effects before drawing footer text
    clearTextEffects(ctx);
    
    // Prepare to draw footer text
    ctx.textAlign = 'center';
    
    // For dark themes, add a gold outline without shadows
    if (selectedTheme === 'night' || selectedTheme === 'forest') {
      ctx.strokeStyle = TIMBERS_GOLD;
      ctx.lineWidth = 1;
      ctx.strokeText(footerText, width / 2, height - 140);
    }
    
    // Draw the text without shadow effects
    ctx.fillText(footerText, width / 2, height - 140);
    
    // Keep shadow effects disabled
    clearTextEffects(ctx);
  }, [canvasRef, dimensions, includeDateTime, nextMatches, selectedBackground, selectedTheme, showPatchImage, customText, selectedFont, fontSizeMultiplier, backgroundThemes]);

  // Effect to reset canvas on page unload/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (ctx) {
          // Force clean reset before page unloads
          canvas.width = 1;
          canvas.height = 1;
        }
      }
    };
    
    // Add event listener for page unloads
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [canvasRef]);

  // Main effect to handle rendering
  useEffect(() => {
    if (canvasRef.current) {
      debugLog('Generating wallpaper with:', { selectedBackground, selectedTheme, customText, selectedFont, fontSizeMultiplier });
      
      // Handle resetting the canvas before redrawing
      const canvas = canvasRef.current;
      // Get a fresh context - this can help prevent persistent state issues
      const ctx = canvas.getContext('2d', { alpha: false });
      
      if (ctx) {
        // Store dimensions
        const width = dimensions.width;
        const height = dimensions.height;
        
        // The most reliable way to clear the canvas is to modify its dimensions
        // This completely resets the canvas and all context states
        canvas.width = 1;
        canvas.height = 1;
        canvas.width = width;
        canvas.height = height;
        
        // Apply additional cleaning steps
        resetCanvas(ctx, width, height);
        
        // Triple check we've cleared all transformations and paths
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.beginPath();
      }
      
      // Short timeout to ensure DOM updates before redrawing
      // This can help prevent ghost effects during rapid changes
      setTimeout(() => {
        generateWallpaper();
      }, 10);
    }
  }, [selectedBackground, selectedTheme, dimensions, nextMatches, includeDateTime, canvasRef, generateWallpaper, showPatchImage, customText, selectedFont, fontSizeMultiplier]);

  return null;
};

export default WallpaperCanvas;
