const fs = require('fs');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

async function generateCircularFavicon(inputPath, outputPath, size) {
  // Create canvas with the desired size
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Load the tree ring image
  const image = await loadImage(inputPath);

  // Clear the canvas
  ctx.clearRect(0, 0, size, size);

  // Create a circular clipping path
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.clip();

  // Calculate dimensions to maintain aspect ratio
  const scale = Math.max(size / image.width, size / image.height);
  const x = (size - image.width * scale) / 2;
  const y = (size - image.height * scale) / 2;

  // Draw the image
  ctx.drawImage(image, x, y, image.width * scale, image.height * scale);

  // Save the result
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(outputPath, buffer);
}

async function main() {
  // Create output directory if it doesn't exist
  const iconsDir = path.join(__dirname, '..', 'public', 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir);
  }

  const inputPath = path.join(__dirname, '..', 'public', 'background', 'tree-ring.webp');

  // Generate different sizes
  await generateCircularFavicon(inputPath, path.join(iconsDir, 'favicon-16x16.png'), 16);
  await generateCircularFavicon(inputPath, path.join(iconsDir, 'favicon-32x32.png'), 32);
  await generateCircularFavicon(inputPath, path.join(iconsDir, 'apple-touch-icon.png'), 180);

  console.log('✓ Circular favicons generated successfully!');
}

main().catch(console.error);
