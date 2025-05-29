/**
 * Application-wide constants for the Timbers Wallpaper Generator
 */

// Default positions
export const DEFAULT_PATCH_POSITION_Y = 0.4; // 40% down from top
export const DEFAULT_MATCH_POSITION_Y = 0.26; // 26% margin from bottom
export const MIN_MATCH_POSITION = 0.01; // Minimum match position
export const MAX_MATCH_POSITION = 0.4; // Maximum match position

// Default text
export const DEFAULT_TEXT = "PORTLAND TIMBERS";
export const DEFAULT_TEXT_COLOR = "#FFFFFF";
export const DEFAULT_FONT_SIZE_MULTIPLIER = 1.0;

// Timbers colors
export const TIMBERS_GREEN = "#004812";
export const TIMBERS_GOLD = "#EAC713";
export const TIMBERS_WHITE = "#FFFFFF";
export const TIMBERS_BLACK = "#000000";

// Default phone model
export const DEFAULT_IPHONE_MODEL = "iphone15";

// Wallpaper file name
export const DEFAULT_WALLPAPER_FILENAME = "timbers-wallpaper.png";

// iPhone models and their dimensions
export const IPHONE_MODELS = [
  { value: "iphone16promax", label: "iPhone 16 Pro Max", width: 1290, height: 2796 },
  { value: "iphone16pro", label: "iPhone 16 Pro", width: 1179, height: 2556 },
  { value: "iphone15", label: "iPhone 15/15 Pro", width: 1179, height: 2556 },
  { value: "iphone15plus", label: "iPhone 15 Plus/Pro Max", width: 1290, height: 2796 },
  { value: "custom", label: "Custom (1080x2337)", width: 1080, height: 2337 },
];

// Font options
export const FONT_OPTIONS = [
  "Another Danger",
  "Rose",
  "Urban Jungle",
  "Avenir", 
  "Verdana",
  "Lethal Slime"
];
