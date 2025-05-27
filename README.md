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
