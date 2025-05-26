import React from 'react';
import { Download } from 'lucide-react';
import { formatDateForWallpaper, formatTime } from '../utils/dateFormatters';
import { getNext4Matches } from '../utils/scheduleUtils';

/**
 * Component for handling schedule data processing and extraction
 * 
 * @returns {Object} Schedule data and helper functions
 */
const useScheduleData = () => {
  const nextMatches = getNext4Matches();

  return {
    nextMatches,
    formatDateForWallpaper,
    formatTime
  };
};

/**
 * Component for download button and handling download functionality
 * 
 * @param {Object} props - Component props
 * @param {React.RefObject} props.canvasRef - Reference to the canvas element
 * @param {boolean} props.isGenerating - Whether the wallpaper is currently generating
 * @param {Function} props.setIsGenerating - Function to update generating state
 * @param {Function} props.generateWallpaper - Function to generate the wallpaper
 * @returns {JSX.Element} Download button component
 */
const DownloadButton = ({ canvasRef, isGenerating, setIsGenerating, onDownload }) => {
  return (
    <button
      onClick={onDownload}
      disabled={isGenerating}
      className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-600/50 text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg"
    >
      {isGenerating ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          Generating...
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          Download Wallpaper
        </>
      )}
    </button>
  );
};

/**
 * Instructions component
 * @returns {JSX.Element} Instructions component
 */
const Instructions = () => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-3">How to Use</h3>
      <ul className="text-green-200 space-y-2 text-sm">
        <li>• Add images to /public/patches/ folder</li>
        <li>• Update patches-manifest.json with your image list</li>
        <li>• Click "Refresh image list" after adding new images</li>
        <li>• Select your preferred patch image and theme</li>
        <li>• Download and set as your phone wallpaper</li>
        <li>• Schedule updates automatically with current fixtures</li>
      </ul>
    </div>
  );
};

/**
 * Footer component
 * @returns {JSX.Element} Footer component
 */
const Footer = () => {
  return (
    <>
      <div className="text-center">
        <p className="text-yellow-400 font-bold text-lg">
          RCTID - Rose City Till I Die! 🌹⚽
        </p>
      </div>

      <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 text-center">
        <h3 className="text-lg font-bold text-white mb-3">Support the Developer</h3>
        <div className="flex flex-col items-center space-y-3">
          <div className="bg-white p-3 rounded-lg">
            <img
              src="/bmc_qr.png"
              alt="Buy Me a Coffee QR Code"
              className="w-24 h-24"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs hidden">
              QR Code
            </div>
          </div>
          <a
            href="https://buymeacoffee.com/automatebldrs"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            ☕ Buy Me a Coffee
          </a>
          <p className="text-green-200 text-sm">
            Enjoy the wallpaper? Support future updates!
          </p>
        </div>
      </div>
    </>
  );
};

export { useScheduleData, DownloadButton, Instructions, Footer };
