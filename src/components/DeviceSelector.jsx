import React from 'react';

/**
 * Component for selecting the device size
 * 
 * @param {Object} props - Component props
 * @param {string} props.selectediPhoneSize - Current selected iPhone size
 * @param {Function} props.setSelectediPhoneSize - Function to update selected iPhone size
 * @param {Array} props.iPhoneSizes - Available iPhone size options
 * @returns {JSX.Element} Device selector component
 */
const DeviceSelector = ({ selectediPhoneSize, setSelectediPhoneSize, iPhoneSizes }) => {
  // Get current iPhone dimensions
  const getCurrentDimensions = () => {
    const selected = iPhoneSizes.find(size => size.value === selectediPhoneSize);
    return selected || iPhoneSizes[0];
  };

  return (
    <div>
      {/* Title handled by AccordionPanel */}
      <select
        value={selectediPhoneSize}
        onChange={(e) => setSelectediPhoneSize(e.target.value)}
        className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 mb-3"
      >
        {iPhoneSizes.map((size) => (
          <option key={size.value} value={size.value} className="bg-gray-800">
            {size.label}
          </option>
        ))}
      </select>
      <p className="text-green-200 text-sm">
        {getCurrentDimensions().width} × {getCurrentDimensions().height} pixels
      </p>
    </div>
  );
};

export default DeviceSelector;
