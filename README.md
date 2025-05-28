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

### v2.7.9 (May 28, 2025)

- Added text color customization with color picker
- Updated all text elements to use consistent color
- Implemented custom color selection with color palette
- Improved UI for text customization options

### v2.7.8 (May 28, 2025)

- Added randomized font and background theme selection on page load
- Improved patch image toggle with a more noticeable toggle switch UI
- Enhanced user experience with visual feedback for toggle interactions

### v2.7.6 (May 27, 2025)

- Fixed match time display to correctly show times in Pacific Time (PT)
- Improved match row positioning to avoid overlap with footer text
- Added responsive layout adjustments for different screen sizes

### v2.7.5 (May 27, 2025)

- Increased SCHEDULE_BOTTOM_MARGIN from 280px to 340px to prevent footer overlap
- Improved vertical spacing between match row and footer text
- Fixed match display positioning for all device sizes

### v2.7.4 (May 27, 2025)

- Refactored layout with named constants for all vertical positioning
- Added layout variables for consistent spacing and dimensions
- Improved maintainability with centralized positioning variables
- Standardized padding and spacing for match display elements

### v2.7.3 (May 27, 2025)

- Fixed match row positioning to prevent footer overlap
- Synchronized positioning and formatting between main and alternate versions
- Updated match row to use fixed position relative to bottom
- Applied consistent time formatting and padding

### v2.7.2 (May 27, 2025)

- Fixed syntax error in match display loop
- Fixed initialization of match section variables
- Removed duplicate match display code
- Ensured correct positioning of match row above footer

### v2.7.1 (May 27, 2025)

- Moved match row to just above the footer for better layout balance
- Added more padding between logos, dates, and times for improved readability
- Converted time format to 12-hour with compact AM/PM indicators (a/p)
- Improved vertical spacing throughout the wallpaper

### v2.7.0 (May 27, 2025)

- Redesigned match display to a horizontal layout with opponent logos in a single row
- Simplified date format to MM/DD format under each opponent logo
- Removed match borders and Timbers logos for cleaner design
- Increased size of opponent logos for better visibility
- Updated layout to better match official Timbers schedule aesthetics
- Supports up to 6 upcoming matches at a time

### v2.6.3 (May 27, 2025)

- Fixed missing match overlays when downloading wallpapers on desktop
- Separated date/time rendering from match overlay rendering
- Improved canvas rendering during download process
- Increased timeout values to ensure complete capture of all elements
- Added includeMatches parameter to control match display independently

### v2.6.2 (May 27, 2025)

- Fixed "Invalid Date" issue in Next Matches section on iOS devices
- Improved date parsing for cross-browser compatibility
- Added robust date handling for iOS Safari
- Enhanced error handling for date and time formatting
- Fixed schedule data display in HTML interface

### v2.6.1 (May 27, 2025)

- Fixed remaining iOS image background download issue
- Improved Canvas-to-Blob conversion for iOS Safari compatibility
- Enhanced image loading with decode() API to ensure images are properly processed
- Added better error handling for image backgrounds on iOS devices
- Fixed download functionality to work reliably with image backgrounds

### v2.6.0 (May 27, 2025)

- Moved background and patch images from public folder to assets folder
- Fixed iOS image download issues with Vite's asset handling
- Resolved CORS restrictions for background images
- Ensured compatibility with iOS Safari for downloaded wallpapers
- Updated image loading utility to use Vite's URL imports

### v2.5.0 (May 27, 2025)

- Fixed match information not showing in downloaded wallpapers with gradient backgrounds
- Ensured schedule section always appears in final wallpapers

### v2.4.0 (May 27, 2025)

- Fixed ghost effect/shadow issues on text elements when refreshing the page
- Fixed shadow artifacts when selecting different patches
- Added comprehensive canvas context reset utility
- Improved text rendering to prevent shadow persistence
- Added page refresh handling to ensure clean canvas state

### v2.4.1 (May 27, 2025)

- Fixed date/time display issues on iOS/Safari browsers
- Improved cross-browser compatibility for match information
