import React from 'react';
import { Text, Type } from 'lucide-react';

/**
 * Component for customizing display text on the wallpaper
 * 
 * @param {Object} props - Component props
 * @param {string} props.customText - Current custom text
 * @param {Function} props.setCustomText - Function to update custom text
 * @param {string} props.selectedFont - Currently selected font
 * @param {Function} props.setSelectedFont - Function to update selected font
 * @returns {JSX.Element} Text customizer component
 */
const TextCustomizer = ({ customText, setCustomText, selectedFont, setSelectedFont }) => {
  const MAX_LENGTH = 50;

  // Font options
  const fontOptions = [
    { value: 'Arial', label: 'Arial (Bold)', className: 'font-sans font-bold' },
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
          <div className="grid grid-cols-2 gap-2">
            {fontOptions.map((font) => (
              <label 
                key={font.value}
                className={`
                  flex items-center justify-between border rounded-lg px-3 py-2 cursor-pointer
                  ${selectedFont === font.value 
                    ? 'bg-[#00482B] border-yellow-400 text-white' 
                    : 'bg-white/10 border-white/30 text-white/80'}
                `}
              >
                <span 
                  className={font.className}
                  style={{ fontFamily: font.value }}
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

        {/* Text Preview */}
        <div className="mt-4">
          <label className="block text-white mb-2 text-sm opacity-75">
            Preview
          </label>
          <div 
            className="bg-[#00482B]/30 border border-white/20 rounded-lg p-3 text-center"
            style={{ 
              minHeight: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span 
              className="text-white text-lg"
              style={{ 
                fontFamily: selectedFont,
                fontWeight: ['Arial', 'Verdana'].includes(selectedFont) ? 'bold' : 'normal',
                fontSize: selectedFont === 'Lethal Slime' ? '24px' : 'inherit',
                letterSpacing: selectedFont === 'Lethal Slime' ? '1px' : 'normal',
                textTransform: selectedFont === 'Lethal Slime' ? 'uppercase' : 'none',
                textShadow: '1px 1px 3px rgba(0,0,0,0.5)'
              }}
            >
              {selectedFont === 'Lethal Slime' ? (customText || 'PORTLAND TIMBERS').toUpperCase() : (customText || 'PORTLAND TIMBERS')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextCustomizer;
