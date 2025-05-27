/**
 * PatchPatrol.com Patch Scraper
 * 
 * This script scrapes patch images and metadata from PatchPatrol.com/patches/page/3/
 * and saves them to the public/patches folder. If a patches-manifest.json file exists,
 * the script will append to it rather than overwrite it.
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs-extra';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const BASE_URL = 'https://patchpatrol.com';
const PATCHES_URL = `${BASE_URL}/patches/page/4/`;
const OUTPUT_DIR = path.join(__dirname, '../src/assets/patches');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'patches-manifest.json');
const DELAY_MS = 1000; // Delay between requests to be respectful

// Configure axios with browser-like headers
const axiosInstance = axios.create({
  maxRedirects: 5,
  validateStatus: function (status) {
    return status >= 200 && status < 400; // Accept 2xx and 3xx status codes
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Referer': 'https://patchpatrol.com/'
  },
  timeout: 10000
});

// Ensure the patches directory exists
fs.ensureDirSync(OUTPUT_DIR);

/**
 * Delay execution for specified milliseconds
 */
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Download an image from a URL
 * @param {string} url - Image URL
 * @param {string} filepath - Destination path
 * @returns {Promise<void>}
 */
async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, response => {
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download image: ${response.statusCode}`));
      }
      
      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${path.basename(filepath)}`);
        resolve();
      });
      
      fileStream.on('error', err => {
        fs.unlink(filepath, () => {}); // Delete the file if there's an error
        reject(err);
      });
    }).on('error', reject);
  });
}

/**
 * Scrape patches from PatchPatrol page 2
 */
async function scrapePatches() {
  try {
    console.log(`Fetching patches from ${PATCHES_URL}...`);
    const response = await axiosInstance.get(PATCHES_URL);
    const $ = cheerio.load(response.data);
    
    // Array to hold all patch data
    const patches = [];
    
    // Find all patch thumbnails with the ptfz-patch-thumb-w class
    const patchElements = $('.ptfz-patch-thumb-w');
    console.log(`Found ${patchElements.length} patch elements.`);
    
    // Process each patch element
    for (let i = 0; i < patchElements.length; i++) {
      const element = patchElements[i];
      
      // Find the image element
      const imageElement = $(element).find('img.wp-post-image');
      if (!imageElement.length) {
        console.log('No image found, skipping this element.');
        continue;
      }
      
      // Get image URL
      let imageUrl = imageElement.attr('src');
      if (!imageUrl) {
        console.log('No image URL found, skipping this element.');
        continue;
      }
      
      // Ensure absolute URL
      if (!imageUrl.startsWith('http')) {
        imageUrl = imageUrl.startsWith('/') ? `${BASE_URL}${imageUrl}` : `${BASE_URL}/${imageUrl}`;
      }
      
      // Get metadata from solid-bg div
      const infoDiv = $(element).find('.solid-bg');
      if (!infoDiv.length) {
        console.log('No info div found, skipping this element.');
        continue;
      }
      
      // Extract patch info
      const label = $(infoDiv).find('b').text().trim();
      
      // Extract year using regex
      let year = '';
      const yearMatch = $(infoDiv).text().match(/Year:\s*(\d{4})/i);
      if (yearMatch && yearMatch[1]) {
        year = yearMatch[1];
      }
      
      // Extract ID using regex
      let id = '';
      const idMatch = $(infoDiv).find('.patchID').text().match(/ID:\s*(\d+)/i);
      if (idMatch && idMatch[1]) {
        id = idMatch[1];
      }
      
      // Extract filename from image URL
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      console.log(`Processing patch: ${label} (${filename})`);
      
      // Download the image
      const imageFilePath = path.join(OUTPUT_DIR, filename);
      try {
        await downloadImage(imageUrl, imageFilePath);
        
        // Add to patches array
        patches.push({
          filename,
          label,
          year,
          id
        });
        
        // Add a delay between downloads to be respectful
        await delay(DELAY_MS);
        
      } catch (err) {
        console.error(`Error downloading ${filename}: ${err.message}`);
      }
    }
    
    // Check if manifest file already exists
    let existingPatches = [];
    let allPatches = [];
    
    if (fs.existsSync(MANIFEST_PATH)) {
      try {
        const existingManifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
        if (existingManifest && existingManifest.patches && Array.isArray(existingManifest.patches)) {
          existingPatches = existingManifest.patches;
          console.log(`Found existing manifest with ${existingPatches.length} patches.`);
        }
      } catch (err) {
        console.error(`Error reading existing manifest: ${err.message}`);
      }
    }
    
    // Combine existing patches with new ones, avoiding duplicates
    const existingFilenames = new Set(existingPatches.map(p => p.filename));
    const newUniquePatches = patches.filter(p => !existingFilenames.has(p.filename));
    
    allPatches = [...existingPatches, ...newUniquePatches];
    
    // Create or update manifest file
    const manifest = {
      patches: allPatches
    };
    
    fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
    console.log(`Updated manifest file with ${patches.length} new patches (total: ${allPatches.length}) at ${MANIFEST_PATH}`);
    
  } catch (error) {
    console.error('Error scraping patches:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
  }
}

// Run the scraper
scrapePatches();
