import React from 'react';
import { ImageIcon } from 'lucide-react';

/**
 * Component for selecting the patch image
 * 
 * @param {Object} props - Component props
 * @param {string} props.selectedBackground - Current selected background
 * @param {Function} props.setSelectedBackground - Function to update selected background
 * @param {Array} props.availableImages - Available patch images
 * @param {boolean} props.isLoadingImages - Loading state for images
 * @param {Function} props.loadAvailableImages - Function to refresh available images
 * @returns {JSX.Element} Patch selector component
 */
const PatchSelector = ({ 
  selectedBackground, 
  setSelectedBackground, 
  availableImages, 
  isLoadingImages, 
  loadAvailableImages 
}) => {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <ImageIcon className="w-5 h-5" />
        Patch Image
        {isLoadingImages && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
        )}
      </h3>

      {isLoadingImages ? (
        <div className="text-green-200 text-sm">Loading available images...</div>
      ) : availableImages.length > 0 ? (
        <>
          <select
            value={selectedBackground}
            onChange={(e) => setSelectedBackground(e.target.value)}
            className="w-full bg-white/20 border border-white/30 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            {availableImages.map((img) => (
              <option key={img.value} value={img.value} className="bg-gray-800">
                {img.label}
              </option>
            ))}
          </select>
          <button
            onClick={loadAvailableImages}
            className="mt-2 text-sm text-green-200 hover:text-green-100 underline"
          >
            Refresh image list
          </button>
        </>
      ) : (
        <div className="text-yellow-200 text-sm space-y-3">
          <p>No patches-manifest.json found in /public/patches/ folder.</p>

          <div className="bg-black/20 rounded p-3 text-xs">
            <p className="text-white font-semibold mb-2">Create /public/patches/patches-manifest.json:</p>
            <pre className="text-green-200 whitespace-pre-wrap">
{`{
  "patches": [
    {
      "filename": "seattle-bonfire-feat.jpg",
      "label": "Seattle Bonfire",
      "description": "Smokey the Bear with bonfire"
    },
    {
      "filename": "smokey-bear-temp-feat.jpg", 
      "label": "Smokey Bear",
      "description": "Classic Smokey Bear patch"
    }
  ]
}`}
            </pre>
          </div>

          <div className="text-xs text-green-200">
            <p>• Add your image files to /public/patches/</p>
            <p>• Create the manifest.json file with the structure above</p>
            <p>• Supports .jpg, .jpeg, .png, .webp files</p>
          </div>

          <button
            onClick={loadAvailableImages}
            className="mt-2 text-green-200 hover:text-green-100 underline"
          >
            Check for manifest file
          </button>
        </div>
      )}
    </div>
  );
};

export default PatchSelector;
