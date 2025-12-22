const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

const resourcesDir = path.join(__dirname, '..', 'resources');
const svgPath = path.join(resourcesDir, 'artifact-engine-icon.svg');
const pngPath = path.join(resourcesDir, 'icon.png');

async function generateIcons() {
  console.log('Converting SVG to PNG (1024x1024)...');

  // Read SVG and convert to high-res PNG
  await sharp(svgPath)
    .resize(1024, 1024)
    .png()
    .toFile(pngPath);

  console.log('Created icon.png');

  // Generate icons directory structure for electron-icon-builder
  const iconsDir = path.join(resourcesDir, 'icons');
  if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
  }

  // Generate multiple PNG sizes for electron-icon-builder
  const sizes = [16, 24, 32, 48, 64, 128, 256, 512, 1024];

  for (const size of sizes) {
    await sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `${size}x${size}.png`));
    console.log(`Created ${size}x${size}.png`);
  }

  // Run electron-icon-builder to generate .icns and .ico
  console.log('\nGenerating .icns and .ico files...');
  try {
    execSync(`npx electron-icon-builder --input="${pngPath}" --output="${resourcesDir}"`, {
      stdio: 'inherit'
    });
    console.log('\nIcon generation complete!');
  } catch (err) {
    console.error('Failed to run electron-icon-builder:', err.message);
    console.log('You may need to manually generate .icns and .ico files');
  }
}

generateIcons().catch(console.error);
