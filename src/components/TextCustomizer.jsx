import React from 'react';
import { Text, Type } from 'lucide-react';
import { debounce } from '../utils/debounce';

/**
 * Component for customizing display text on the wallpaper
 * 
 * @param {Object} props - Component props
 * @param {string} props.customText - Current custom text
 * @param {Function} props.setCustomText - Function to update custom text
 * @param {string} props.selectedFont - Currently selected font
 * @param {Function} props.setSelectedFont - Function to update selected font
 * @param {number} props.fontSizeMultiplier - Multiplier for font size (1.0 is default)
 * @param {Function} props.setFontSizeMultiplier - Function to update font size multiplier
 * @returns {JSX.Element} Text customizer component
 */
const TextCustomizer = ({ 
  customText, 
  setCustomText, 
  selectedFont, 
  setSelectedFont,
  fontSizeMultiplier,
  setFontSizeMultiplier
}) => {
  const MAX_LENGTH = 50;

  // Font options
  const fontOptions = [
    { value: 'Another Danger', label: 'ANOTHER DANGER', className: '' },
    { value: 'Rose', label: 'ROSE', className: '' },
    { value: 'Urban Jungle', label: 'URBAN JUNGLE', className: '' },
    { value: 'Avenir', label: 'Avenir', className: 'font-sans' },
    { value: 'Verdana', label: 'Verdana', className: 'font-sans' },
    { value: 'Lethal Slime', label: 'LETHAL SLIME', className: '' },
  ];

  const handleChange = (e) => {
    const text = e.target.value;
    if (text.length <= MAX_LENGTH) {
      setCustomText(text);
    }
  };

  const handleFontChange = (e) => {
    setSelectedFont(e.target.value);
  };

  // Create a debounced version of setFontSizeMultiplier
  const debouncedSetFontSize = React.useMemo(
    () => debounce((value) => setFontSizeMultiplier(value), 50),
    [setFontSizeMultiplier]
  );

  // Handle font size slider change
  const handleFontSizeChange = (e) => {
    const value = parseFloat(e.target.value);
    debouncedSetFontSize(value);
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Text className="w-5 h-5" />
        Custom Text
      </h3>
      
      <div className="space-y-4">
        <div>
          <input
            type="text"
            value={customText}
            onChange={handleChange}
            placeholder="Enter custom text (up to 50 characters)"
            maxLength={MAX_LENGTH}
            className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 
                       text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-400"
          />
          <div className="text-xs text-white/60 mt-1 flex justify-between">
            <span>Will appear below the patch image</span>
            <span>{customText.length}/{MAX_LENGTH}</span>
          </div>
        </div>

        {/* Font Selector */}
        <div>
          <label className="block text-white mb-2 flex items-center gap-2">
            <Type className="w-4 h-4" />
            Font Style
          </label>
          <div className="grid grid-cols-2 gap-3">
            {fontOptions.map((font) => (
              <label 
                key={font.value}
                className={`
                  flex items-center justify-between border rounded-lg px-2 py-3 cursor-pointer
                  ${selectedFont === font.value 
                    ? 'bg-[#00482B] border-yellow-400 text-white' 
                    : 'bg-white/10 border-white/30 text-white/80'}
                `}
              >
                <span 
                  className={font.className}
                  style={{ 
                    fontFamily: font.value,
                    fontSize: (() => {
                      switch (font.value) {
                        case 'Lethal Slime':
                          return '0.9rem';
                        case 'Another Danger':
                          return '0.95rem';
                        case 'Urban Jungle':
                          return '0.95rem';
                        default:
                          return '1.15rem';
                      }
                    })(),
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {font.label}
                </span>
                <input
                  type="radio"
                  name="fontStyle"
                  value={font.value}
                  checked={selectedFont === font.value}
                  onChange={handleFontChange}
                  className="sr-only"
                />
                <div className={`w-4 h-4 rounded-full border ${selectedFont === font.value ? 'bg-yellow-400 border-yellow-400' : 'bg-transparent border-white/50'}`}>
                  {selectedFont === font.value && (
                    <div className="w-2 h-2 bg-[#00482B] rounded-full m-auto mt-1"></div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Font Size Slider */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-white flex items-center gap-2">
              <span className="text-sm">Font Size</span>
            </label>
            <span className="text-white/80 text-xs">{Math.round(fontSizeMultiplier * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.7"
            max="1.5"
            step="0.05"
            value={fontSizeMultiplier}
            onChange={handleFontSizeChange}
            className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-yellow-400"
          />
          <div className="flex justify-between text-xs text-white/50 mt-1">
            <span>Small</span>
            <span>Default</span>
            <span>Large</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextCustomizer;
