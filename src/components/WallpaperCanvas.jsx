import React, { useEffect, useCallback } from 'react';
import { tryLoadImage, createFallbackLogo } from '../utils/imageLoader';
import { drawDateAndTime } from '../utils/dateFormatters';
import { getThemeBackground, addThemeEffects, TIMBERS_GREEN, TIMBERS_GOLD, TIMBERS_WHITE } from '../utils/backgroundRenderers';
import { debugLog, debugWarn, debugError } from '../utils/debug';

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

    const ctx = canvas.getContext('2d');
    const width = dimensions.width;
    const height = dimensions.height;

    canvas.width = width;
    canvas.height = height;

    // Create themed background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // Apply theme-specific background
    const themeBackground = await getThemeBackground(selectedTheme, ctx, width, height, backgroundThemes);
    if (themeBackground instanceof HTMLImageElement) {
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
      
      ctx.drawImage(themeBackground, drawX, drawY, drawWidth, drawHeight);
      
      // Add a subtle dark overlay to ensure text readability
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, width, height);
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
        const selectedImg = await tryLoadImage(`/patches/${selectedBackground}`);
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

    // Custom text 
    ctx.fillStyle = TIMBERS_WHITE;
    
    // Set font size and weight based on selected font
    let fontSize, fontWeight;
    
    if (selectedFont === 'Lethal Slime') {
      // Special handling for Lethal Slime font
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
      
      // Scaling for Another Danger which is also wide but different proportions
      if (customText.length <= 8) {
        fontSize = 65; // Very short text can be larger
      } else if (customText.length <= 12) {
        fontSize = 55;
      } else if (customText.length <= 16) {
        fontSize = 48;
      } else if (customText.length <= 20) {
        fontSize = 42;
      } else if (customText.length <= 25) {
        fontSize = 36;
      } else if (customText.length <= 30) {
        fontSize = 32;
      } else {
        fontSize = 28; // Very small for long text
      }
      
      // Apply font size multiplier
      fontSize = Math.round(fontSize * fontSizeMultiplier);
    } else if (selectedFont === 'Rose') {
      // Special handling for Rose font
      fontWeight = 'normal';
      
      // Scaling for Rose font which has unique proportions
      if (customText.length <= 8) {
        fontSize = 58; // Very short text can be larger
      } else if (customText.length <= 12) {
        fontSize = 52;
      } else if (customText.length <= 16) {
        fontSize = 46;
      } else if (customText.length <= 20) {
        fontSize = 40;
      } else if (customText.length <= 25) {
        fontSize = 34;
      } else if (customText.length <= 30) {
        fontSize = 30;
      } else {
        fontSize = 26; // Very small for long text
      }
      
      // Apply font size multiplier
      fontSize = Math.round(fontSize * fontSizeMultiplier);
    } else if (selectedFont === 'Urban Jungle') {
      // Special handling for Urban Jungle font
      fontWeight = 'normal';
      
      // Scaling for Urban Jungle which can be thinner
      if (customText.length <= 8) {
        fontSize = 62; // Very short text can be larger
      } else if (customText.length <= 12) {
        fontSize = 54;
      } else if (customText.length <= 16) {
        fontSize = 48;
      } else if (customText.length <= 20) {
        fontSize = 42;
      } else if (customText.length <= 25) {
        fontSize = 36;
      } else if (customText.length <= 30) {
        fontSize = 32;
      } else {
        fontSize = 28; // Very small for long text
      }
      
      // Apply font size multiplier
      fontSize = Math.round(fontSize * fontSizeMultiplier);
    } else {
      // Normal handling for system fonts
      fontWeight = ['Verdana'].includes(selectedFont) ? 'bold' : 'normal';
      fontSize = 48;
      if (customText.length > 30) {
        fontSize = 42;
      }
      if (customText.length > 40) {
        fontSize = 38;
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
    }
    
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
    
    // Reset shadow and other text effects for other elements
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

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
      ctx.fillStyle = TIMBERS_GOLD;
      const vsFont = Math.floor(width * 0.026);
      ctx.font = `bold ${vsFont}px "Avenir Next"`;
      ctx.textAlign = 'center';
      ctx.fillText(match.isHome ? 'VS' : '@', centerX, matchY + 8);

      // Match date and time on the right side of logos
      const dateTimeX = centerX + logoSpacing + logoSize / 2 + Math.floor(width * 0.046);

      // Match date
      ctx.fillStyle = TIMBERS_WHITE;
      const matchDateFont = Math.floor(width * 0.026);
      ctx.font = `bold ${matchDateFont}px "Avenir Next"`;
      ctx.textAlign = 'left';
      const formattedDate = match.date ? new Date(match.date + ' UTC').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: 'America/Los_Angeles',
      }) : 'TBD';
      ctx.fillText(formattedDate.replace(',', ''), dateTimeX, matchY - 20);

      // Match time below date
      ctx.fillStyle = TIMBERS_GOLD;
      const matchTimeFont = Math.floor(width * 0.024);
      ctx.font = `${matchTimeFont}px "Avenir Next"`;
      ctx.textAlign = 'left';
      const timeText = match.time ? new Date(match.time + ' UTC').toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Los_Angeles',
      }) : 'TBD';
      ctx.fillText(timeText, dateTimeX, matchY + 15);
      
      // Add home/away status below time
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
    
    // Add text shadow for better readability
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Add subtle gold border around text for extra pop against dark backgrounds
    if (selectedTheme === 'night' || selectedTheme === 'forest') {
      ctx.strokeStyle = TIMBERS_GOLD;
      ctx.lineWidth = 1;
      ctx.strokeText(footerText, width / 2, height - 140);
    }
    
    ctx.textAlign = 'center';
    ctx.fillText(footerText, width / 2, height - 140);
    
    // Reset shadow and other text effects
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }, [canvasRef, dimensions, includeDateTime, nextMatches, selectedBackground, selectedTheme, showPatchImage, customText, selectedFont, fontSizeMultiplier, backgroundThemes]);

  useEffect(() => {
    if (canvasRef.current) {
      debugLog('Generating wallpaper with:', { selectedBackground, selectedTheme, customText, selectedFont, fontSizeMultiplier });
      generateWallpaper();
    }
  }, [selectedBackground, selectedTheme, dimensions, nextMatches, includeDateTime, canvasRef, generateWallpaper, showPatchImage, customText, selectedFont, fontSizeMultiplier]);

  return null;
};

export default WallpaperCanvas;
