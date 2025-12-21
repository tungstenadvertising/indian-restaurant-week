import imagemin from 'imagemin';
import imageminWebp from 'imagemin-webp';
import { readdirSync, statSync, existsSync, unlinkSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = resolve(__dirname, '../dist');

// Recursively find all PNG/JPG files in a directory
function findImageFiles(dir, basePath = '') {
  const files = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const relativePath = join(basePath, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      // Recursively search subdirectories
      files.push(...findImageFiles(fullPath, relativePath));
    } else if (/\.(png|jpe?g)$/i.test(item)) {
      // Check if this file already has a WebP version
      const baseName = item.replace(/\.(png|jpe?g)$/i, '');
      const dirFiles = readdirSync(dir);
      const hasWebpVersion = dirFiles.some(f =>
        f === baseName + '.webp' || (f.startsWith(baseName + '-') && f.endsWith('.webp'))
      );

      // For dish.png files, check if responsive WebP versions exist (dish-105w.webp, etc.)
      // If they do, we can convert and remove the original
      if (item === 'dish.png' && dirFiles.some(f => f.startsWith('dish-') && f.endsWith('.webp'))) {
        // Convert dish.png to dish.webp even though responsive versions exist
        // This provides a fallback and we can remove the PNG
        files.push({
          fullPath,
          relativePath,
          dir,
          fileName: item
        });
      } else if (!hasWebpVersion) {
        files.push({
          fullPath,
          relativePath,
          dir,
          fileName: item
        });
      }
    }
  }

  return files;
}

async function convertImagesToWebP() {
  console.log('🖼️  Converting images to WebP...');

  // Convert chef images
  const chefsDir = join(distDir, 'images/chefs');
  if (!existsSync(chefsDir)) {
    console.log('⚠️  Chefs directory not found, skipping conversion');
  } else {
    await convertDirectory(chefsDir, 'chefs');
  }

  // Convert global images (except those handled by Astro Image component)
  const globalDir = join(distDir, 'images/global');
  if (existsSync(globalDir)) {
    await convertDirectory(globalDir, 'global');
  }
}

async function convertDirectory(targetDir, dirName) {

  let convertedCount = 0;
  let removedCount = 0;

  // Check if this is a directory with subdirectories (like chefs) or flat (like global)
  const items = readdirSync(targetDir);
  const subdirs = items.filter(item => statSync(join(targetDir, item)).isDirectory());

  if (subdirs.length > 0) {
    // Process subdirectories (like chefs/chef-name/)
    for (const subdir of subdirs) {
      const subdirPath = join(targetDir, subdir);
      const imageFiles = findImageFiles(subdirPath, `${dirName}/${subdir}`);

      for (const { fullPath, relativePath, dir, fileName } of imageFiles) {
        const result = await processImageFile(fullPath, relativePath, dir, fileName);
        if (result.converted) convertedCount++;
        if (result.removed) removedCount++;
      }
    }
  } else {
    // Process files directly in the directory (e.g., global/)
    const imageFiles = findImageFiles(targetDir, dirName);
    for (const { fullPath, relativePath, dir, fileName } of imageFiles) {
      const result = await processImageFile(fullPath, relativePath, dir, fileName);
      if (result.converted) convertedCount++;
      if (result.removed) removedCount++;
    }
  }

  return { convertedCount, removedCount };
}

async function processImageFile(fullPath, relativePath, dir, fileName) {
  try {
    const result = await imagemin([fullPath], {
      destination: dir,
      plugins: [
        imageminWebp({ quality: 85 })
      ]
    });

    if (result.length > 0) {
      const webpName = fileName.replace(/\.(png|jpe?g)$/i, '.webp');
      console.log(`  ✓ Converted: ${relativePath} → ${webpName}`);

      // Remove original PNG/JPG file after successful conversion
      try {
        unlinkSync(fullPath);
        return { converted: true, removed: true };
      } catch (removeError) {
        console.warn(`  ⚠️  Could not remove original ${relativePath}:`, removeError.message);
        return { converted: true, removed: false };
      }
    }
  } catch (error) {
    console.warn(`  ⚠️  Failed to convert ${relativePath}:`, error.message);
  }

  return { converted: false, removed: false };
}

convertImagesToWebP()
  .then(() => {
    console.log('✅ Image conversion complete!');
  })
  .catch(console.error);

