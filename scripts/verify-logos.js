// This script verifies that all logo files referenced in the manifest actually exist
// It helps identify any file path issues that might prevent logos from displaying

// Import the manifest
import manifest from '../assets/logo/logo-manifest.json';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

// Helper to convert URL to filepath
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Root directory is two levels up from utils folder
const ROOT_DIR = path.resolve(__dirname, '../');

/**
 * Verify that all logo files exist
 */
function verifyLogoFiles() {
  console.log('Verifying logo files referenced in manifest...');
  
  if (!manifest || !manifest.logos || !Array.isArray(manifest.logos)) {
    console.error('❌ Logo manifest is invalid or empty');
    return false;
  }
  
  const logoDir = path.resolve(ROOT_DIR, 'assets/logo');
  console.log(`Base logo directory: ${logoDir}`);
  
  const results = {
    total: manifest.logos.length,
    found: 0,
    missing: [],
  };
  
  manifest.logos.forEach(logo => {
    // Get the filename from the src path
    const filename = path.basename(logo.src);
    
    // Check if file exists in assets/logo directory
    const logoPath = path.resolve(logoDir, filename);
    const exists = fs.existsSync(logoPath);
    
    console.log(`${exists ? '✅' : '❌'} Logo for ${logo.name} (${logoPath})`);
    
    if (exists) {
      results.found++;
    } else {
      results.missing.push({
        name: logo.name,
        path: logoPath,
        src: logo.src
      });
    }
  });
  
  // Summary
  console.log('\nVerification Results:');
  console.log(`- Total logos in manifest: ${results.total}`);
  console.log(`- Found: ${results.found}`);
  console.log(`- Missing: ${results.missing.length}`);
  
  if (results.missing.length > 0) {
    console.log('\nMissing logos:');
    results.missing.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name}: ${item.src} (expected at ${item.path})`);
    });
    return false;
  }
  
  return true;
}

// Run the verification
verifyLogoFiles();

export { verifyLogoFiles };
