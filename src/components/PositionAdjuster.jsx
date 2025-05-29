import React from 'react';
import { MoveVertical, ArrowDownToLine, ArrowUpToLine } from 'lucide-react';
import { debounce } from '../utils/debounce';
import { DEFAULT_PATCH_POSITION_Y, DEFAULT_MATCH_POSITION_Y, MIN_MATCH_POSITION, MAX_MATCH_POSITION } from '../utils/constants';

/**
 * Component for adjusting the vertical positions of elements on the wallpaper
 * 
 * @param {Object} props - Component props
 * @param {number} props.patchPositionY - Current vertical position multiplier for patch (0.2 to 0.8)
 * @param {Function} props.setPatchPositionY - Function to update patch position
 * @param {number} props.matchPositionY - Current vertical position multiplier for match info (0.1 to 0.4)
 * @param {Function} props.setMatchPositionY - Function to update match position
 * @returns {JSX.Element} Position adjustment sliders
 */
const PositionAdjuster = ({
  patchPositionY,
  setPatchPositionY,
  matchPositionY,
  setMatchPositionY
}) => {
  // Create debounced versions of the position setters
  const debouncedSetPatchPosition = React.useMemo(
    () => debounce((value) => setPatchPositionY(value), 50),
    [setPatchPositionY]
  );

  const debouncedSetMatchPosition = React.useMemo(
    () => debounce((value) => setMatchPositionY(value), 50),
    [setMatchPositionY]
  );

  const handlePatchPositionChange = (e) => {
    const value = parseFloat(e.target.value);
    debouncedSetPatchPosition(value);
  };

  const handleMatchPositionChange = (e) => {
    const value = parseFloat(e.target.value);
    debouncedSetMatchPosition(value);
  };

  return (
    <div>
      {/* Removed outer container styling since AccordionPanel now handles it */}
      
      <div className="space-y-5">
        {/* Patch & Text Position Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-white flex items-center gap-2">
              <MoveVertical className="w-4 h-4" />
              <span>Patch & Text Position</span>
            </label>
            <span className="text-white/80 text-xs">{Math.round(patchPositionY * 100)}%</span>
          </div>            <input
            type="range"
            min="0.2"
            max="0.8"
            step="0.01"
            value={0.8 - (patchPositionY - 0.2)}
            onChange={(e) => {
              // Convert slider value back to actual position value
              const sliderValue = parseFloat(e.target.value);
              const actualValue = 0.8 - (sliderValue - 0.2);
              debouncedSetPatchPosition(actualValue);
            }}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-yellow-400"
          />
          <div className="flex justify-between text-xs text-white/50 mt-1">
            <span>Lower</span>
            <span>Default</span>
            <span>Higher</span>
          </div>
          <p className="text-xs text-white/60 mt-2">
            Adjust the vertical position of the patch image and text
          </p>
        </div>

        {/* Match Info Position Slider */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-white flex items-center gap-2">
              <MoveVertical className="w-4 h-4" />
              <span>Match Info Position</span>
            </label>
            <span className="text-white/80 text-xs">{Math.round(matchPositionY * 100)}%</span>
          </div>
          <input
            type="range"
            min={MIN_MATCH_POSITION.toString()}
            max={MAX_MATCH_POSITION.toString()}
            step="0.01"
            value={matchPositionY}
            onChange={handleMatchPositionChange}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-yellow-400"
          />
          <div className="flex justify-between text-xs text-white/50 mt-1">
            <span>Lower</span>
            <span>Default</span>
            <span>Higher</span>
          </div>
          <p className="text-xs text-white/60 mt-2">
            Adjust the vertical position of the match schedule
          </p>
        </div>
      </div>
    </div>
  );
};

export default PositionAdjuster;
