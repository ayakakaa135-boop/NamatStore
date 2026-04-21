/**
 * سكريبت ضغط الصور - يحوّل الصور الكبيرة إلى WebP مع الحفاظ على الجودة
 */
import sharp from 'sharp';
import { readdir, stat, unlink } from 'fs/promises';
import { join, extname, basename } from 'path';

const IMG_DIR = join(process.cwd(), 'public', 'image');
const MAX_WIDTH = 1200;
const QUALITY = 80;
const SIZE_THRESHOLD = 200 * 1024; // 200KB

async function compressImages() {
  const files = await readdir(IMG_DIR);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png)$/i.test(f));
  
  console.log(`\n🖼️  Found ${imageFiles.length} images to process...\n`);
  
  let totalSaved = 0;
  
  for (const file of imageFiles) {
    const filePath = join(IMG_DIR, file);
    const fileStats = await stat(filePath);
    const originalSize = fileStats.size;
    
    // Skip small files
    if (originalSize < SIZE_THRESHOLD) {
      console.log(`  ✅ ${file} (${(originalSize / 1024).toFixed(0)}KB) — already optimized`);
      continue;
    }
    
    const nameWithoutExt = basename(file, extname(file));
    const webpPath = join(IMG_DIR, `${nameWithoutExt}.webp`);
    
    try {
      const image = sharp(filePath);
      const metadata = await image.metadata();
      
      let pipeline = image;
      
      // Resize if wider than MAX_WIDTH
      if (metadata.width && metadata.width > MAX_WIDTH) {
        pipeline = pipeline.resize(MAX_WIDTH, null, { withoutEnlargement: true });
      }
      
      await pipeline
        .webp({ quality: QUALITY })
        .toFile(webpPath);
      
      const newStats = await stat(webpPath);
      const saved = originalSize - newStats.size;
      totalSaved += saved;
      
      console.log(
        `  🔄 ${file} (${(originalSize / 1024).toFixed(0)}KB) → ${nameWithoutExt}.webp (${(newStats.size / 1024).toFixed(0)}KB) — saved ${(saved / 1024).toFixed(0)}KB`
      );
      
      // Delete original after successful conversion
      await unlink(filePath);
    } catch (err) {
      console.error(`  ❌ Failed to compress ${file}:`, err.message);
    }
  }
  
  console.log(`\n✨ Total saved: ${(totalSaved / 1024 / 1024).toFixed(1)}MB\n`);
}

compressImages().catch(console.error);
