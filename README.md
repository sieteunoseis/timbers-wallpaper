# Portland Timbers Wallpaper Generator

A customizable wallpaper generator for Portland Timbers fans. Create personalized wallpapers with different themes, patches, fonts, and styles.

## Features

- Multiple background themes and layouts
- Customizable fonts and text
- Searchable Timbers patch selector
- Schedule integration
- Adjustable font size
- High-resolution device mockups

## Development

### Installation

```
npm install
npm run dev
```

### Environment Variables

The application supports the following environment variables:

- `VITE_DEBUG_MODE`: Set to `true` to enable debug logging, `false` to disable

Create a `.env` file in the project root with your desired settings:

```
VITE_DEBUG_MODE=true
```

### Debugging

The app includes a debug utility that respects the `VITE_DEBUG_MODE` environment variable. When enabled, debug messages will be printed to the console.

To use the debug utility in your code:

```js
import { debugLog, debugWarn, debugError } from './utils/debug';

// Regular debug log
debugLog('Loading components...');

// Log with additional data
debugLog('Processing data:', myData);

// Warning log
debugWarn('Image not found, using fallback');

// Error log
debugError('Failed to load resource:', error);
```

Set `VITE_DEBUG_MODE=false` in your production environment to disable all debug messages.

## Version History

### v2.4.0 (May 27, 2025)

- Fixed ghost effect/shadow issues on text elements when refreshing the page
- Fixed shadow artifacts when selecting different patches
- Added comprehensive canvas context reset utility
- Improved text rendering to prevent shadow persistence
- Added page refresh handling to ensure clean canvas state

### v2.4.1 (May 27, 2025)

- Fixed date/time display issues on iOS/Safari browsers
- Improved cross-browser compatibility for match information

### v2.4.2 (May 27, 2025)

- Fixed download button functionality on iOS with image backgrounds
- Added iOS-specific detection and handling for wallpaper downloads
- Implemented screenshot guidance for iOS users
- Enhanced canvas rendering for better iOS support
- Added visual indicators for screenshot capture
- Improved error messaging and user guidance

### v2.4.4 (May 27, 2025)

- Improved download functionality on iOS to only show screenshot instructions when using image backgrounds
- Fixed direct download for gradient backgrounds and patch images on iOS
- Enhanced error messages to provide clearer instructions based on selected background type
- Fixed date display in "Next 4 Matches" section on HTML page
