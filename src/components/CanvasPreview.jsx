import React from 'react';

/**
 * Component for displaying the iPhone preview mockup
 * 
 * @param {Object} props - Component props
 * @param {React.RefObject} props.canvasRef - Reference to the canvas element
 * @returns {JSX.Element} Canvas preview component
 */
const CanvasPreview = ({ canvasRef }) => {
  return (
    <div className="relative">
      {/* iPhone Frame */}
      <div className="w-80 h-[640px] bg-black rounded-[3rem] p-2 shadow-2xl">
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative">
          {/* Notch with subtle outline */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10 ring-1 ring-white/20"></div>

          {/* Wallpaper Preview - Full screen */}
          <canvas
            ref={canvasRef}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default CanvasPreview;
