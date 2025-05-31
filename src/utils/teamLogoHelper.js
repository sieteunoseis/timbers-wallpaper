// Direct import with explicit path using URL for Vite
import manifest from '../assets/logo/logo-manifest.json';
const logoManifest = manifest;

/**
 * Get higher quality logo URL for a team from the manifest
 * 
 * @param {string} teamName - The name of the team to look up
 * @param {string} shortCode - The short code of the team (e.g., 'SJE', 'TOR')
 * @returns {string|null} - URL of the logo if found in manifest, null otherwise
 */
export function getTeamLogoFromManifest(teamName, shortCode) {
  if (!teamName && !shortCode) return null;
  
  // Make sure we have the logo manifest
  if (!logoManifest || !logoManifest.logos || !Array.isArray(logoManifest.logos)) {
    console.warn('Logo manifest not found or invalid format');
    return null;
  }
  
  // First try to match by short code if available (most reliable)
  if (shortCode) {
    const shortCodeMatch = logoManifest.logos.find(logo => 
      logo.short_code && logo.short_code.trim().toUpperCase() === shortCode.trim().toUpperCase()
    );
    
    if (shortCodeMatch) {
      try {
        // Import the logo dynamically based on the path from manifest
        // Create a proper import URL that Vite can handle
        const logoSrc = shortCodeMatch.src;
        const logoFilename = logoSrc.split('/').pop(); // Get just the filename
        const fullLogoUrl = new URL(`../assets/logo/${logoFilename}`, import.meta.url).href;
        
        // Success - found logo by short code
        
        return fullLogoUrl;
      } catch (error) {
        console.error(`Error creating URL for logo ${shortCodeMatch.src}:`, error);
        return null;
      }
    }
  }
  
  // If no short code match, try by name
  if (teamName) {
    // Normalize the team name for matching
    const normalizedName = teamName.trim().toLowerCase();
    
    // Try to find a matching logo in the manifest
    const matchedLogo = logoManifest.logos.find(logo => {
      // Normalize the logo name for matching
      const logoName = logo.name.trim().toLowerCase();
      
      // Check if the team name is contained in the logo name or vice versa
      return normalizedName.includes(logoName) || logoName.includes(normalizedName);
    });
  
  if (matchedLogo) {
      // Fix the logo URL to use the correct format
      // Ensure it starts with a slash if needed
      const logoSrc = matchedLogo.src;
      
      // Import the actual logo file through Vite's asset pipeline
      // This ensures the file is properly processed, hashed, and available in production
      try {
        // Import the logo dynamically based on the path from manifest
        // Create a proper import URL that Vite can handle
        // The src in the manifest starts with "../logo/" but we need to transform that
        // into a path relative to this file (in the utils folder)
        const logoFilename = logoSrc.split('/').pop(); // Get just the filename
        const fullLogoUrl = new URL(`../assets/logo/${logoFilename}`, import.meta.url).href;
        
        // Success - found logo by name
        
        return fullLogoUrl;
      } catch (error) {
        console.error(`Error creating URL for logo ${logoSrc}:`, error);
        return null;
      }
    }
  }
  
  // No match found by either short code or name
  return null;
}
