import React from 'react';

/**
 * Component for selecting the background theme
 * 
 * @param {Object} props - Component props
 * @param {string} props.selectedTheme - Current selected theme
 * @param {Function} props.setSelectedTheme - Function to update selected theme
 * @param {Array} props.themeOptions - Available theme options
 * @param {boolean} props.isLoading - Whether themes are still loading
 * @returns {JSX.Element} Theme selector component
 */
const ThemeSelector = ({ selectedTheme, setSelectedTheme, themeOptions, isLoading = false }) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-green-600 to-blue-600"></div>
        Background Theme
      </h3>
      {isLoading ? (
        <div className="w-full py-2 text-center text-white/60">
          <span className="animate-pulse">Loading themes...</span>
        </div>
      ) : (
        <select
          value={selectedTheme}
          onChange={(e) => setSelectedTheme(e.target.value)}
          className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-3"
        >
          {themeOptions.map((theme) => (
            <option key={theme.value} value={theme.value} className="bg-gray-800">
              {theme.label} {theme.type === 'image' && '(Image)'}
            </option>
          ))}
        </select>
      )}
      <p className="text-green-200 text-sm">
        {themeOptions.find(t => t.value === selectedTheme)?.description}
      </p>
    </div>
  );
};

export default ThemeSelector;
