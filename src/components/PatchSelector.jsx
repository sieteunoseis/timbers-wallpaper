import React from 'react';
import Select from 'react-select';

const ITEMS_PER_PAGE = 50;

/**
 * Component for selecting the patch image with search functionality
 * 
 * @param {Object} props - Component props
 * @param {string} props.selectedBackground - Current selected background
 * @param {Function} props.setSelectedBackground - Function to update selected background
 * @param {Array} props.availableImages - Available patch images
 * @param {boolean} props.isLoadingImages - Loading state for images
 * @param {Function} props.loadAvailableImages - Function to refresh available images
 * @param {boolean} props.showPatchImage - Whether to show the patch image
 * @param {Function} props.setShowPatchImage - Function to update show patch image state
 * @returns {JSX.Element} Patch selector component
 */
const PatchSelector = React.memo(({ 
  selectedBackground, 
  setSelectedBackground, 
  availableImages, 
  isLoadingImages, 
  loadAvailableImages,
  showPatchImage,
  setShowPatchImage
}) => {
  return (
    <div>
      {isLoadingImages && (
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4 bg-black/20 rounded-lg p-3">
        <label htmlFor="show-patch-toggle" className="text-sm font-medium text-white">
          Show patch image
        </label>
        <button
          id="show-patch-toggle"
          type="button"
          onClick={() => setShowPatchImage(!showPatchImage)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-1 focus:ring-offset-black ${
            showPatchImage ? 'bg-[#00482B]' : 'bg-gray-700'
          }`}
          role="switch"
          aria-checked={showPatchImage}
        >
          <span className="sr-only">Show patch image</span>
          <span
            className={`${
              showPatchImage ? 'translate-x-6 bg-yellow-400' : 'translate-x-1 bg-gray-300'
            } inline-block h-4 w-4 transform rounded-full transition`}
          />
        </button>
      </div>

      {!showPatchImage ? (
        <div className="text-green-200 text-sm">Patch image disabled. No image will be displayed in the center.</div>
      ) : isLoadingImages ? (
        <div className="text-green-200 text-sm">Loading available images...</div>
      ) : availableImages.length > 0 ? (
        <>
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-white">Select a patch:</div>
            <button
              onClick={() => {
                if (availableImages.length > 0) {
                  const randomIndex = Math.floor(Math.random() * availableImages.length);
                  setSelectedBackground(availableImages[randomIndex].value);
                }
              }}
              className="text-sm bg-[#00482B] hover:bg-[#005733] text-white px-3 py-1 rounded-md flex items-center"
              title="Choose a random patch"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Random
            </button>
          </div>
          <Select
            value={availableImages.find(img => img.value === selectedBackground)}
            onChange={(option) => setSelectedBackground(option.value)}
            options={availableImages}
            defaultOptions={availableImages.slice(0, ITEMS_PER_PAGE)}
            isSearchable
            isClearable
            isLoading={isLoadingImages}
            placeholder="Select a patch..."
            noOptionsMessage={() => "No patches found"}
            filterOption={(option, inputValue) => {
              const label = option.data.label.toLowerCase();
              const id = option.data.id?.toLowerCase() || '';
              const searchValue = inputValue.toLowerCase();
              return label.includes(searchValue) || id.includes(searchValue);
            }}
            formatOptionLabel={(option, { context }) => (
              <div className="flex justify-between items-center">
                <span>{option.label}</span>
                {option.id && context === 'menu' && (
                  <span className="text-xs bg-[#00482B] text-white px-2 py-1 rounded-full ml-2">
                    ID: {option.id}
                  </span>
                )}
              </div>
            )}
            menuPortalTarget={document.body}
            menuPosition={'fixed'}
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                boxShadow: 'none',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
              }),
              menuPortal: (base) => ({ 
                ...base, 
                zIndex: 9999 
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: '#d69a00', // dark green
              }),
              option: (base, { isFocused, isSelected }) => ({
                ...base,
                backgroundColor: isSelected 
                  ? 'rgba(217, 119, 6, 0.2)' // yellow-600/20
                  : isFocused 
                    ? 'rgba(255, 255, 255, 0.1)' // white/10 
                    : undefined,
                ':active': {
                  backgroundColor: 'rgba(217, 119, 6, 0.3)', // yellow-600/30
                },
              }),
              singleValue: (base) => ({
                ...base,
                color: 'white',
              }),
              input: (base) => ({
                ...base,
                color: 'white',
              }),
              dropdownIndicator: (base) => ({
                ...base,
                color: 'rgba(255, 255, 255, 0.6)',
                ':hover': {
                  color: 'rgba(255, 255, 255, 0.8)',
                },
              }),
              placeholder: (base) => ({
                ...base,
                color: 'rgba(255, 255, 255, 0.6)',
              }),
            }}
          />
          <button
            onClick={loadAvailableImages}
            className="mt-2 text-sm text-green-200 hover:text-green-100 underline"
          >
            Refresh image list
          </button>
        </>
      ) : (
        <div className="text-yellow-200 text-sm space-y-3">
          <p>No patches-manifest.json found in the assets folder.</p>

          <div className="bg-black/20 rounded p-3 text-xs">
            <p className="text-white font-semibold mb-2">Create /src/assets/patches/patches-manifest.json:</p>
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
            <p>• Add your image files to /src/assets/patches/</p>
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
});

export default PatchSelector;
