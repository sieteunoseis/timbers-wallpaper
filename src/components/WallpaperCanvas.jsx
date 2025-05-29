import React, { useEffect, useCallback, useRef } from 'react';
import { tryLoadImage, createFallbackLogo } from '../utils/imageLoader';
import { drawDateAndTime } from '../utils/dateFormatters';
import { getThemeBackground, addThemeEffects, createFallbackGradient, TIMBERS_GREEN, TIMBERS_GOLD, TIMBERS_WHITE } from '../utils/backgroundRenderers';
import { clearTextEffects, resetCanvas } from '../utils/textEffects';
import { debugLog, debugWarn } from '../utils/debug';

// Helper functions moved outside component to avoid recreation
const loadFont = async (name, url) => {
  try {
    // Check if font is already loaded in document.fonts
    if (Array.from(document.fonts.values()).some(font => font.family === name)) {
      return true;
    }

    // Create new FontFace with longer timeout for slow connections
    const font = new FontFace(name, `url(${url})`);
    
    // Set a timeout for font loading (10 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Font loading timeout')), 10000);
    });

    // Wait for font to load with timeout
    const loadedFont = await Promise.race([
      font.load(),
      timeoutPromise
    ]);

    // Ensure font is properly decoded before adding
    await loadedFont.loaded;
    
    // Add to document fonts and force a layout to ensure it's ready
    document.fonts.add(loadedFont);
    
    // Verify font is actually available
    await document.fonts.ready;
    const isFontAvailable = document.fonts.check(`12px "${name}"`);
    
    if (!isFontAvailable) {
      throw new Error('Font loaded but not available for use');
    }

    debugLog(`Successfully loaded font: ${name}`);
    return true;
  } catch (error) {
    debugWarn(`Failed to load font ${name}:`, error);
    return false;
  }
};

const getFontUrl = (fontName) => {
  // Always use /fonts/ root path for public folder access
  switch (fontName) {
    case 'Another Danger':
      return '/fonts/Another Danger.otf';
    case 'Lethal Slime':
      return '/fonts/Lethal Slime.ttf';
    case 'Rose':
      return '/fonts/Rose.otf';
    case 'Urban Jungle':
      return '/fonts/UrbanJungle.otf';
    default:
      return null;
  }
};

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
 * @param {string} props.selectedFont - Font family to use for the custom text
 * @param {number} props.fontSizeMultiplier - Multiplier for font size (1.0 is default)
 * @param {string} props.textColor - Color to use for all text elements
 * @param {number} props.patchPositionY - Vertical position multiplier for patch and text (0.2 to 0.8)
 * @param {number} props.matchPositionY - Vertical position multiplier for match info margin from bottom (0.1 to 0.4)
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
  textColor = "#FFFFFF",
  patchPositionY = 0.4,
  matchPositionY = 0.26
}) => {
  const renderStateRef = useRef({
    animationFrame: null,
    lastRenderTime: 0,
    isRendering: false,
    hasInitialRender: false,
    fontsLoaded: new Set()
  });

  // Canvas state management
  const resetCanvasState = useCallback((width, height) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      debugWarn('resetCanvasState: Canvas ref is null');
      return;
    }

    debugLog('resetCanvasState called with:', { width, height });
    debugLog('Canvas element details before reset:', {
      clientWidth: canvas.clientWidth,
      clientHeight: canvas.clientHeight,
      width: canvas.width,
      height: canvas.height,
      offsetWidth: canvas.offsetWidth,
      offsetHeight: canvas.offsetHeight,
      style: canvas.style.cssText,
      classList: Array.from(canvas.classList)
    });

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      debugWarn('resetCanvasState: Failed to get canvas context');
      return;
    }

    // Ensure we have valid dimensions
    if (!width || !height || width <= 0 || height <= 0) {
      debugWarn('resetCanvasState: Invalid dimensions', { width, height });
      return;
    }

    canvas.width = 1;
    canvas.height = 1;
    ctx.clearRect(0, 0, 1, 1);
    
    canvas.width = width;
    canvas.height = height;
    
    debugLog('Canvas dimensions set to:', { width: canvas.width, height: canvas.height });
    
    // Fill with black background immediately to provide clean slate
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    debugLog('Canvas initialized with black background');
    
    resetCanvas(ctx, width, height);
    // Safe transformation reset with fallbacks
    try {
      if (ctx.setTransform) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      } else if (ctx.resetTransform) {
        ctx.resetTransform();
      }
    } catch {
      console.warn("Canvas transform methods not supported in this environment");
    }
    ctx.beginPath();
    
    if (ctx.flush) ctx.flush();
  }, [canvasRef]);

  const generateWallpaper = useCallback(async () => {
    debugLog('=== generateWallpaper START ===');
    
    const canvas = canvasRef.current;
    if (!canvas) {
      debugWarn('Canvas ref is null - cannot generate wallpaper');
      return;
    }

    // Debug canvas element properties
    debugLog('Canvas element check:', {
      canvas: !!canvas,
      clientWidth: canvas.clientWidth,
      clientHeight: canvas.clientHeight,
      width: canvas.width,
      height: canvas.height,
      style: canvas.style.cssText
    });

    // Get a fresh context with alpha false - helps with clearing
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      debugWarn('Failed to get canvas context - cannot generate wallpaper');
      return;
    }
    
    const width = dimensions.width;
    const height = dimensions.height;
    
    if (!width || !height || width <= 0 || height <= 0) {
      debugWarn('Invalid dimensions for wallpaper generation:', { width, height });
      return;
    }
    
    debugLog('Starting wallpaper generation with valid dimensions:', { width, height, selectedTheme, selectedBackground, showPatchImage });
    
    // Layout constants for vertical positioning
    // Use the patchPositionY prop with limits to control patch position (0.2 to 0.8)
    const LOGO_Y_PERCENT = Math.max(0.2, Math.min(0.8, patchPositionY)); // Constrained to 20%-80% down from top
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
    const MIN_MATCH_FOOTER_BUFFER = 50; // Minimum 300px between match row and footer text
    // Use the match position directly - slider is now correctly oriented
    // Higher value = more distance from bottom = higher position on screen
    const SCHEDULE_BOTTOM_MARGIN_PERCENT = Math.max(0.1, Math.min(0.4, matchPositionY));
    // Calculate this value considering the total match row height
    const matchRowHeightEstimate = (width * LOGO_SIZE_PERCENT) + TIME_TEXT_PADDING + 20; // Logo + text + padding
    
    // Ensure we don't exceed the canvas height minus footer buffer
    const calculatedMargin = Math.floor(height * SCHEDULE_BOTTOM_MARGIN_PERCENT);
    const minSafeMargin = FOOTER_BOTTOM_MARGIN + matchRowHeightEstimate + MIN_MATCH_FOOTER_BUFFER;
    const SCHEDULE_BOTTOM_MARGIN = Math.max(
      Math.min(calculatedMargin, height - minSafeMargin), // Don't go too high
      minSafeMargin // Don't go too low
    );
    
    // Enhanced canvas reset procedure to prevent ghost images
    
    // Step 1: Force Firefox/Safari to drop cached canvas data by temporarily destroying canvas bitmap
    canvas.width = 1;
    canvas.height = 1;
    
    // Step 2: Set to desired dimensions
    canvas.width = width;
    canvas.height = height;
    
    // Step 3: Clear pixel buffer with black (helps prevent ghosts)
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, width, height);
    
    // Step 4: Reset all context attributes and transformations
    resetCanvas(ctx, width, height);
    
    // Step 5: Explicitly reset transformation matrix to identity
    // Safe transformation reset with fallbacks
    try {
      if (ctx.setTransform) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
      } else if (ctx.resetTransform) {
        ctx.resetTransform();
      }
    } catch (e) {
      console.warn("Canvas transform methods not supported in this environment");
    }
    
    // Step 6: Force buffer flush with an immediate flush command
    ctx.flush && ctx.flush();
    
    // Step 5: Clear the canvas again with a black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    
    // Step 6: Final reset to ensure all states are default
    resetCanvas(ctx, width, height);
    
    // Step 7: Clear any paths that might be lingering
    ctx.beginPath();

    // Create themed background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    debugLog('Black background filled, now loading theme background for:', selectedTheme);

    // Apply theme-specific background
    const themeBackground = await getThemeBackground(selectedTheme, ctx, width, height, backgroundThemes);
    debugLog('Theme background loaded:', { 
      type: themeBackground ? themeBackground.constructor.name : 'null',
      isImage: themeBackground instanceof HTMLImageElement,
      isGradient: themeBackground && themeBackground.addColorStop,
      hasThemeBackground: !!themeBackground
    });
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
      // Use fixed positions by passing height parameter
      drawDateAndTime(ctx, width, height, LOGO_Y, CIRCLE_RADIUS, textColor);
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
    
    debugLog('=== generateWallpaper COMPLETE ===');
  }, [
    canvasRef, 
    dimensions, 
    includeDateTime, 
    includeMatches, 
    nextMatches, 
    selectedBackground, 
    selectedTheme, 
    showPatchImage, 
    customText, 
    selectedFont, 
    fontSizeMultiplier, 
    backgroundThemes, 
    textColor,
    patchPositionY,
    matchPositionY
  ]);

  const queueRender = useCallback(() => {
    debugLog('queueRender called, isRendering:', renderStateRef.current.isRendering);
    
    if (renderStateRef.current.isRendering) return;

    const now = Date.now();
    if (now - renderStateRef.current.lastRenderTime < 50) {
      if (renderStateRef.current.animationFrame) {
        cancelAnimationFrame(renderStateRef.current.animationFrame);
      }
      renderStateRef.current.animationFrame = requestAnimationFrame(queueRender);
      return;
    }

    debugLog('Executing render with dimensions:', { width: dimensions.width, height: dimensions.height });
    renderStateRef.current.lastRenderTime = now;
    renderStateRef.current.isRendering = true;

    // Reset canvas to clean slate with proper dimensions
    resetCanvasState(dimensions.width, dimensions.height);

    const executeRender = async () => {
      try {
        debugLog('Starting wallpaper generation...');
        
        // Prepare canvas with a clean black background
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && dimensions.width > 0 && dimensions.height > 0) {
          debugLog('Setting initial black background...');
          
          // Clean simple black background without any test patterns
          ctx.fillStyle = '#000000'; 
          ctx.fillRect(0, 0, dimensions.width, dimensions.height);
          
          debugLog('Initial black background set');
          
          // Add a small delay then do the full render
          setTimeout(async () => {
            debugLog('Starting full wallpaper generation...');
            await generateWallpaper();
            debugLog('Full wallpaper generation completed');
          }, 5);
        } else {
          debugWarn('Canvas or dimensions not available for initial render');
        }
      } catch (renderError) {
        debugWarn('Error during wallpaper generation:', renderError);
        // On error, show a red error pattern so we know something went wrong
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (ctx && dimensions.width > 0 && dimensions.height > 0) {
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(0, 0, dimensions.width, dimensions.height);
          ctx.fillStyle = '#ffffff';
          ctx.font = '48px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('RENDER ERROR', dimensions.width / 2, dimensions.height / 2);
        }
      } finally {
        renderStateRef.current.isRendering = false;
      }
    };

    if (!renderStateRef.current.hasInitialRender) {
      renderStateRef.current.hasInitialRender = true;
      Promise.resolve().then(executeRender);
    } else {
      setTimeout(executeRender, 10);
    }
  }, [dimensions.width, dimensions.height, generateWallpaper, resetCanvasState, canvasRef]);

  // Initialize font loading first
  useEffect(() => {
    let mounted = true;
    
    const loadFonts = async () => {
      const fontUrl = getFontUrl(selectedFont);
      if (!fontUrl) {
        debugLog('No font URL for', selectedFont, '- assuming system font');
        return true;
      }

      if (renderStateRef.current.fontsLoaded.has(selectedFont)) {
        debugLog('Font already loaded:', selectedFont);
        return true;
      }

      // Try multiple times with increasing delays
      let retryCount = 0;
      const MAX_RETRIES = 3;

      while (retryCount < MAX_RETRIES && mounted) {
        try {
          if (await loadFont(selectedFont, fontUrl)) {
            renderStateRef.current.fontsLoaded.add(selectedFont);
            debugLog('Font loaded successfully after', retryCount, 'retries:', selectedFont);
            return true;
          }

          retryCount++;
          if (retryCount < MAX_RETRIES) {
            debugLog('Retrying font load for', selectedFont, '- attempt', retryCount + 1);
            await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
          }
        } catch (error) {
          debugWarn('Font loading error:', error);
          retryCount++;
          if (retryCount < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, retryCount * 1000));
          }
        }
      }

      debugWarn('Failed to load font after', MAX_RETRIES, 'attempts:', selectedFont);
      return false;
    };

    loadFonts().then((success) => {
      if (!mounted) return;

      if (success) {
        renderStateRef.current.hasInitialRender = false;
        // Reset the canvas and queue a new render
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          resetCanvas(ctx, dimensions.width, dimensions.height);
        }
        requestAnimationFrame(queueRender);
      } else {
        // If font failed to load, fall back to system font
        debugWarn('Falling back to system font for:', selectedFont);
        renderStateRef.current.hasInitialRender = false;
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          resetCanvas(ctx, dimensions.width, dimensions.height);
        }
        requestAnimationFrame(queueRender);
      }
    });

    return () => {
      mounted = false;
    };
  }, [selectedFont, queueRender, canvasRef, dimensions.width, dimensions.height]);

  // Force initial render on mount - this ensures canvas is never blank
  useEffect(() => {
    debugLog('WallpaperCanvas mounted, forcing initial render');
    
    // Wait a tiny bit for dimensions to be available, then force render
    const timeoutId = setTimeout(() => {
      if (dimensions.width > 0 && dimensions.height > 0) {
        debugLog('Forcing initial render with dimensions:', dimensions);
        renderStateRef.current.hasInitialRender = false;
        const currentFrame = renderStateRef.current.animationFrame;
        if (currentFrame) {
          cancelAnimationFrame(currentFrame);
        }
        renderStateRef.current.animationFrame = requestAnimationFrame(queueRender);
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [dimensions.width, dimensions.height, queueRender]); // Fixed dependencies

  // Main rendering effect - now checks font loading state
  useEffect(() => {
    // More lenient asset checking - allow initial render even without all assets
    const hasMinimumAssets = dimensions.width > 0 && dimensions.height > 0;
    
    // Optional assets - these can be missing on initial load
    const hasTheme = selectedTheme && selectedTheme.length > 0;
    const hasPatchWhenNeeded = !showPatchImage || selectedBackground;
    
    // Check font status - but don't block rendering completely
    const fontUrl = getFontUrl(selectedFont);
    const fontReady = !fontUrl || renderStateRef.current.fontsLoaded.has(selectedFont);
    
    // Debug logging to help diagnose loading issues
    debugLog('Canvas render check:', {
      showPatchImage,
      selectedBackground,
      selectedTheme,
      width: dimensions.width,
      height: dimensions.height,
      hasMinimumAssets,
      hasTheme,
      hasPatchWhenNeeded,
      fontReady,
      selectedFont,
      fontUrl
    });
    
    if (!hasMinimumAssets) {
      debugLog('Skipping render - missing minimum assets (dimensions):', {
        width: dimensions.width,
        height: dimensions.height,
        hasMinimumAssets
      });
      return;
    }
    
    // Allow rendering even without theme or patch - will use fallbacks
    debugLog('Proceeding with render - minimum assets available');
    
    // Always proceed with rendering even if fonts aren't ready yet
    // The font loading effect will trigger a re-render when fonts are loaded

    // Reset render state for asset changes
    if (selectedBackground || selectedTheme) {
      renderStateRef.current.hasInitialRender = false;
    }

    const currentFrame = renderStateRef.current.animationFrame;
    if (currentFrame) {
      cancelAnimationFrame(currentFrame);
    }

    debugLog('Queueing render animation frame...');
    renderStateRef.current.animationFrame = requestAnimationFrame(queueRender);

    return () => {
      if (currentFrame) {
        cancelAnimationFrame(currentFrame);
      }
    };
  }, [
    dimensions.width,
    dimensions.height,
    selectedBackground,
    selectedTheme,
    showPatchImage,
    selectedFont,
    queueRender
  ]);

  return null;
};

export default WallpaperCanvas;
