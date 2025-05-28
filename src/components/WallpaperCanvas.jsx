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
 * @param {boolean} props.includeMatches - Whether to show match overlays (defaults to true)
 * @param {boolean} props.showPatchImage - Whether to show the patch image
 * @param {string} props.customText - Custom text to display instead of "PORTLAND TIMBERS"
 * @param {string} props.selectedFont - Font family to use for the custom text. 
 *                                      Available options: "Another Danger" (caps only), "Avenir", "Verdana" (bold), "Rose", "Urban Jungle" or "Lethal Slime" (caps only)
 * @param {number} props.fontSizeMultiplier - Multiplier for font size (1.0 is default)
 * @param {string} props.textColor - Color to use for all text elements
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
  includeMatches = true,
  showPatchImage = true,
  customText = "PORTLAND TIMBERS",
  selectedFont = "Arial",
  fontSizeMultiplier = 1.0,
  textColor = "#FFFFFF"
}) => {
  const generateWallpaper = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Get a fresh context with alpha false - helps with clearing
    const ctx = canvas.getContext('2d', { alpha: false });
    const width = dimensions.width;
    const height = dimensions.height;
    
    // Layout constants for vertical positioning
    const LOGO_Y_PERCENT = 0.4; // 40% down from top
    const LOGO_Y = Math.floor(height * LOGO_Y_PERCENT);
    const CIRCLE_RADIUS_PERCENT = 0.2; // 20% of min dimension
    const CIRCLE_RADIUS = Math.floor(Math.min(width, height) * CIRCLE_RADIUS_PERCENT);
    const PATCH_TEXT_OFFSET = 380; // Distance from logo center to text when patch is shown
    const NO_PATCH_TEXT_OFFSET = 100; // Distance from logo center to text when no patch
    const FOOTER_BOTTOM_MARGIN = 140; // Distance from bottom of screen to footer text
    const DATE_TEXT_PADDING = 40; // Padding between logo and date text
    const TIME_TEXT_PADDING = 75; // Padding between logo and time text
    const LOGO_SIZE_PERCENT = 0.12; // Logo size as percentage of width
    const MATCH_ROW_WIDTH_PERCENT = 0.85; // Width of match row as percentage of screen width
    // Minimum buffer space between match row bottom and footer text
    const MIN_MATCH_FOOTER_BUFFER = 300; // Minimum 300px between match row and footer text
    // Make schedule position responsive based on screen height
    const SCHEDULE_BOTTOM_MARGIN_PERCENT = 0.26; // 26% from bottom (responsive)
    // Calculate this value considering the total match row height
    const matchRowHeightEstimate = (width * LOGO_SIZE_PERCENT) + TIME_TEXT_PADDING + 20; // Logo + text + padding
    const SCHEDULE_BOTTOM_MARGIN = Math.max(740, Math.floor(height * SCHEDULE_BOTTOM_MARGIN_PERCENT), 
                                      FOOTER_BOTTOM_MARGIN + matchRowHeightEstimate + MIN_MATCH_FOOTER_BUFFER);
    
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

    // Use the defined constants for central image area positioning
    // Note: LOGO_Y and CIRCLE_RADIUS are already calculated

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
        ctx.arc(width / 2, LOGO_Y, CIRCLE_RADIUS, 0, 2 * Math.PI);
        ctx.clip();

        // Calculate dimensions to fit image in circle while maintaining aspect ratio
        const scaleFactor = 1.0; // Adjust this value between 0 and 1 to scale the image
        const imgAspect = selectedImg.width / selectedImg.height;
        const circleSize = CIRCLE_RADIUS * 2;
        const scaledCircleSize = circleSize * scaleFactor;

        let imgWidth, imgHeight, imgX, imgY;

        if (imgAspect > 1) {
          // Image is wider than tall
          imgWidth = scaledCircleSize;
          imgHeight = scaledCircleSize / imgAspect;
          imgX = width / 2 - (scaledCircleSize / 2);
          imgY = LOGO_Y - imgHeight / 2;
        } else {
          // Image is taller than wide
          imgHeight = scaledCircleSize;
          imgWidth = scaledCircleSize * imgAspect;
          imgX = width / 2 - imgWidth / 2;
          imgY = LOGO_Y - (scaledCircleSize / 2);
        }

        // Draw the image
        ctx.drawImage(selectedImg, imgX, imgY, imgWidth, imgHeight);
        ctx.restore();

        // Add a subtle border around the circular image
        ctx.beginPath();
        ctx.arc(width / 2, LOGO_Y, CIRCLE_RADIUS, 0, 2 * Math.PI);
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
    
    ctx.fillStyle = textColor;
    
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
    
    // Adjust text position if no patch image is shown - using our constants
    const textY = showPatchImage ? LOGO_Y + PATCH_TEXT_OFFSET : LOGO_Y + NO_PATCH_TEXT_OFFSET;
    
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
    ctx.fillStyle = textColor;
    
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
      drawDateAndTime(ctx, width, LOGO_Y, CIRCLE_RADIUS, textColor);
    }

    // Schedule section - Horizontal layout in a single row
    // Only render matches if includeMatches is true
    if (includeMatches && nextMatches && nextMatches.length > 0) {
      // Calculate position for the schedule row - just above the footer
      // Calculate the total height of the match row including text elements
      const logoSize = Math.floor(width * LOGO_SIZE_PERCENT);
      const dateTextY = (height - SCHEDULE_BOTTOM_MARGIN) + logoSize/2 + DATE_TEXT_PADDING;
      const timeTextY = (height - SCHEDULE_BOTTOM_MARGIN) + logoSize/2 + TIME_TEXT_PADDING;
      const matchRowBottomY = timeTextY;
      const spaceToFooter = (height - FOOTER_BOTTOM_MARGIN) - matchRowBottomY;
      
      // Add debug line to log positions
      const isOverlapping = spaceToFooter < MIN_MATCH_FOOTER_BUFFER;
      debugLog(`Match row position [${isOverlapping ? 'OVERLAP DETECTED' : 'GOOD SPACING'}]:`, { 
        height, 
        SCHEDULE_BOTTOM_MARGIN, 
        scheduleY: height - SCHEDULE_BOTTOM_MARGIN,
        footerY: height - FOOTER_BOTTOM_MARGIN,
        matchRowBottomY,
        spaceToFooter,
        minBufferRequired: MIN_MATCH_FOOTER_BUFFER,
        logoSize,
        matchRowHeightEstimate,
        dateTextY,
        timeTextY
      });
      const scheduleY = height - SCHEDULE_BOTTOM_MARGIN;
      
      // Maximum matches to display
      const maxMatches = Math.min(nextMatches.length, 6);
      const totalWidth = width * MATCH_ROW_WIDTH_PERCENT;
      const itemWidth = totalWidth / maxMatches; // Width per match item
      
      // Start X position to center the entire row
      const startX = (width - totalWidth) / 2;
      
      // Draw each opponent logo in a horizontal row
      for (let i = 0; i < maxMatches; i++) {
        const match = nextMatches[i];
        const itemCenterX = startX + (i * itemWidth) + (itemWidth / 2);
        
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

        // White circle background for logo
        ctx.fillStyle = TIMBERS_WHITE;
        ctx.beginPath();
        ctx.arc(itemCenterX, scheduleY, logoSize / 2, 0, 2 * Math.PI);
        ctx.fill();

        // Draw opponent logo
        ctx.save();
        ctx.beginPath();
        ctx.arc(itemCenterX, scheduleY, logoSize / 2 - 2, 0, 2 * Math.PI);
        ctx.clip();

        if (opponentLogo instanceof HTMLCanvasElement) {
          ctx.drawImage(opponentLogo, itemCenterX - logoSize / 2 + 2, scheduleY - logoSize / 2 + 2, logoSize - 4, logoSize - 4);
        } else {
          ctx.drawImage(opponentLogo, itemCenterX - logoSize / 2 + 2, scheduleY - logoSize / 2 + 2, logoSize - 4, logoSize - 4);
        }
        ctx.restore();

        // Format date as short format (MM/DD)
        let shortDate = 'TBD';
        if (match.date) {
          try {
            const parts = match.date.split(' ');
            const dateParts = parts[0].split('-');
            
            // Create date using individual components
            const matchDate = new Date(Date.UTC(
              parseInt(dateParts[0], 10),
              parseInt(dateParts[1], 10) - 1,
              parseInt(dateParts[2], 10)
            ));
            
            // Format as MM/DD
            const month = matchDate.getMonth() + 1; // getMonth() is zero-based
            const day = matchDate.getDate();
            shortDate = `${month}/${day}`;
          } catch (e) {
            console.error('Error formatting short date:', e);
            shortDate = 'TBD';
          }
        }
        
        // Format time in 12-hour format with AM/PM in Pacific Time
        let shortTime = 'TBD';
        if (match.time) {
          try {
            const parts = match.time.split(' ');
            
            if (parts.length >= 2) {
              const dateParts = match.date.split('-');
              const timeParts = parts[1].split(':');
              
              // Create a UTC date object first
              const matchDateTime = new Date(Date.UTC(
                parseInt(dateParts[0], 10),
                parseInt(dateParts[1], 10) - 1,
                parseInt(dateParts[2], 10),
                parseInt(timeParts[0], 10),
                parseInt(timeParts[1], 10),
                0
              ));
              
              // Convert to Pacific Time
              const pacificTime = matchDateTime.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
                timeZone: 'America/Los_Angeles'
              });
              
              // Format as "1:30p" style
              shortTime = pacificTime
                .replace(':00', '') // Remove :00 for whole hours
                .replace(/\s?(AM|PM)$/i, (match) => match.trim().toLowerCase().charAt(0));
            }
          } catch (e) {
            console.error('Error formatting short time:', e);
            shortTime = 'TBD';
          }
        }

        // Draw date below logo with padding
        clearTextEffects(ctx);
        ctx.fillStyle = textColor;
        const dateFont = Math.floor(width * 0.034);
        ctx.font = `bold ${dateFont}px "Avenir Next"`;
        ctx.textAlign = 'center';
        ctx.fillText(shortDate, itemCenterX, scheduleY + logoSize/2 + DATE_TEXT_PADDING);

        // Draw time below date with padding
        clearTextEffects(ctx);
        ctx.fillStyle = textColor;
        const timeFont = Math.floor(width * 0.028);
        ctx.font = `bold ${timeFont}px "Avenir Next"`;
        ctx.textAlign = 'center';
        ctx.fillText(shortTime, itemCenterX, scheduleY + logoSize/2 + TIME_TEXT_PADDING);
      }
    }

    // Footer
    ctx.fillStyle = textColor;
    
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
      ctx.strokeText(footerText, width / 2, height - FOOTER_BOTTOM_MARGIN);
    }
    
    // Draw the text without shadow effects
    ctx.fillText(footerText, width / 2, height - FOOTER_BOTTOM_MARGIN);
    
    // Keep shadow effects disabled
    clearTextEffects(ctx);
  }, [canvasRef, dimensions, includeDateTime, includeMatches, nextMatches, selectedBackground, selectedTheme, showPatchImage, customText, selectedFont, fontSizeMultiplier, backgroundThemes, textColor]);

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
  }, [selectedBackground, selectedTheme, dimensions, nextMatches, includeDateTime, includeMatches, canvasRef, generateWallpaper, showPatchImage, customText, selectedFont, fontSizeMultiplier, textColor]);

  return null;
};

export default WallpaperCanvas;
