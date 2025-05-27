import React, { useEffect } from 'react';

/**
 * Component for displaying the iPhone preview mockup
 * 
 * @param {Object} props - Component props
 * @param {React.RefObject} props.canvasRef - Reference to the canvas element
 * @returns {JSX.Element} Canvas preview component
 */
const CanvasPreview = ({ canvasRef }) => {
  // Add CSS for the screenshot highlight effect
  useEffect(() => {
    // Add the CSS if it doesn't already exist
    if (!document.getElementById('screenshot-styles')) {
      const style = document.createElement('style');
      style.id = 'screenshot-styles';
      style.textContent = `
        @keyframes screenshotPulse {
          0% { box-shadow: 0 0 0 0 rgba(234, 232, 39, 0.7); }
          70% { box-shadow: 0 0 0 15px rgba(234, 232, 39, 0); }
          100% { box-shadow: 0 0 0 0 rgba(234, 232, 39, 0); }
        }
        
        .screenshot-ready {
          animation: screenshotPulse 1s ease-in-out infinite;
        }
        
        .canvas-preview-container.screenshot-ready::after {
          content: "📸 Take a screenshot now";
          position: absolute;
          bottom: -40px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 66, 18, 0.8);
          color: #EAE827; /* Timbers gold */
          padding: 8px 16px;
          border-radius: 8px;
          font-weight: bold;
          white-space: nowrap;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="relative canvas-preview-container" id="wallpaper-preview">
      {/* iPhone Frame */}
      <div className="w-80 h-[640px] bg-black rounded-[3rem] p-2 shadow-2xl">
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative">
          {/* Notch with subtle outline */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10 ring-1 ring-white/20"></div>

          {/* Wallpaper Preview - Full screen */}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover"
            aria-label="Wallpaper preview - take a screenshot of this area on iOS"
          />
        </div>
      </div>
    </div>
  );
};

export default CanvasPreview;
