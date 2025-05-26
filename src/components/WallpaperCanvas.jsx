import React, { useEffect } from 'react';
import { tryLoadImage, createFallbackLogo } from '../utils/imageLoader';
import { drawDateAndTime } from '../utils/dateFormatters';
import { getThemeBackground, addThemeEffects, TIMBERS_GREEN, TIMBERS_GOLD, TIMBERS_WHITE } from '../utils/backgroundRenderers';

/**
 * Component responsible for rendering the wallpaper on canvas
 * 
 * @param {Object} props - Component props
 * @param {React.RefObject} props.canvasRef - Reference to the canvas element
 * @param {string} props.selectedBackground - Selected patch image
 * @param {string} props.selectedTheme - Selected theme
 * @param {Object} props.dimensions - Current device dimensions
 * @param {Array} props.nextMatches - Array of upcoming matches
 * @param {boolean} props.includeDateTime - Whether to include date/time on the wallpaper
 * @returns {null} This component doesn't render UI elements directly
 */
const WallpaperCanvas = ({ 
  canvasRef, 
  selectedBackground, 
  selectedTheme, 
  dimensions, 
  nextMatches, 
  includeDateTime = true
}) => {
  const generateWallpaper = async () => {
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
    const themeBackground = await getThemeBackground(selectedTheme, ctx, width, height);
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
    addThemeEffects(selectedTheme, ctx, width, height);

    // Draw central image area - Moved much lower towards bottom
    const logoY = Math.floor(height * 0.4); // 40% down from top
    const circleRadius = Math.floor(Math.min(width, height) * 0.2);

    // Load and draw the selected image in the circular area
    let selectedImg;
    try {
      selectedImg = await tryLoadImage(`/patches/${selectedBackground}`);
      console.log('Selected image loaded successfully');

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
      console.log('Failed to load selected image:', error);
      // Fallback: Create the original circular logo area
      ctx.beginPath();
      ctx.arc(width / 2, logoY, circleRadius, 0, 2 * Math.PI);
      ctx.fillStyle = TIMBERS_GREEN;
      ctx.fill();

      // Add rose symbol (simplified representation)
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(width / 2, logoY, 25, 0, 2 * Math.PI);
      ctx.fill();

      // Add leaves around (simplified)
      ctx.fillStyle = TIMBERS_GREEN;
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI * 2) / 8;
        const x = width / 2 + Math.cos(angle) * 60;
        const y = logoY + Math.sin(angle) * 60;
        ctx.beginPath();
        ctx.ellipse(x, y, 20, 35, angle + Math.PI / 2, 0, 2 * Math.PI);
        ctx.fill();
      }
    }

    // "TIMBERS" text
    ctx.fillStyle = TIMBERS_WHITE;
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PORTLAND TIMBERS', width / 2, logoY + 400);

    // Include date/time if requested
    if (includeDateTime) {
      drawDateAndTime(ctx, width, logoY, circleRadius);
    }

    // Schedule section - Vertical layout below content
    const scheduleStartY = logoY + 540;

    // Load Portland Timbers logo with fallback
    let timbersLogo;
    const timbersLogoUrl = 'https://cdn.sportmonks.com/images/soccer/teams/31/607.png';
    try {
      timbersLogo = await tryLoadImage(timbersLogoUrl);
      console.log('Timbers logo loaded successfully');
    } catch (error) {
      console.log('Failed to load Timbers logo, using fallback:', error);
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

      // Add subtle border with rounded corners
      ctx.strokeStyle = 'rgba(214, 175, 59, 0.5)';
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
      ctx.font = `bold ${vsFont}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(match.isHome ? 'VS' : '@', centerX, matchY + 8);

      // Match date and time on the right side of logos
      const dateTimeX = centerX + logoSpacing + logoSize / 2 + Math.floor(width * 0.046);

      // Match date
      ctx.fillStyle = TIMBERS_WHITE;
      const matchDateFont = Math.floor(width * 0.022);
      ctx.font = `bold ${matchDateFont}px Arial`;
      ctx.textAlign = 'left';
      const formattedDate = match.date ? new Date(match.date + ' UTC').toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        timeZone: 'America/Los_Angeles',
      }) : 'TBD';
      ctx.fillText(formattedDate.replace(',', ''), dateTimeX, matchY - 10);

      // Match time below date
      ctx.fillStyle = TIMBERS_GOLD;
      const matchTimeFont = Math.floor(width * 0.019);
      ctx.font = `${matchTimeFont}px Arial`;
      ctx.textAlign = 'left';
      const timeText = match.time ? new Date(match.time + ' UTC').toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'America/Los_Angeles',
      }) : 'TBD';
      ctx.fillText(timeText, dateTimeX, matchY + 15);
    }

    // Footer
    ctx.fillStyle = TIMBERS_WHITE;
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Rose City Till I Die! 🌹⚽', width / 2, height - 140);
  };

  useEffect(() => {
    if (selectedBackground && canvasRef.current) {
      console.log('Generating wallpaper with:', { selectedBackground, selectedTheme });
      generateWallpaper();
    }
  }, [selectedBackground, selectedTheme, dimensions, nextMatches, includeDateTime]);

  return null;
};

export default WallpaperCanvas;
