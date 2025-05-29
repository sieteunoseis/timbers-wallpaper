import React, { useEffect, useState } from 'react';
import { getCurrentTime, getCurrentDate, getIOSSystemFontFamily } from '../utils/iosFonts';

/**
 * Component for displaying the iPhone preview mockup with time and date
 * 
 * @param {Object} props - Component props
 * @param {React.RefObject} props.canvasRef - Reference to the canvas element
 * @returns {JSX.Element} Canvas preview component
 */
const CanvasPreview = ({ canvasRef }) => {
  const [currentTime, setCurrentTime] = useState(getCurrentTime());
  const [currentDate, setCurrentDate] = useState(getCurrentDate(true)); // true for full weekday name

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime());
      setCurrentDate(getCurrentDate(true));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative">
      {/* iPhone Frame */}
      <div className="w-80 h-[640px] bg-black rounded-[3rem] p-2 shadow-2xl">
        <div className="w-full h-full rounded-[2.5rem] overflow-hidden relative">
          {/* Notch with subtle outline */}
          <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10 ring-1 ring-white/20"></div>
          
          {/* Date display on top (always visible in preview) */}
          <div className="absolute top-12 left-0 right-0 flex justify-center z-20">
            <div className="text-white/90 text-xs font-light tracking-normal" 
                 style={{fontFamily: getIOSSystemFontFamily()}}>{currentDate}</div>
          </div>
          
          {/* Time display below date - much larger */}
          <div className="absolute top-16 left-0 right-0 flex justify-center z-20">
            <div className="text-white font-thin text-6xl tracking-tight"
                 style={{fontFamily: getIOSSystemFontFamily()}}>{currentTime}</div>
          </div>

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
