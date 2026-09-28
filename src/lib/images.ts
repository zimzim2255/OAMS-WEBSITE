import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";

/**
 * Image optimization pipeline — "store imgs in small form for fast rendering".
 *
 * Takes an uploaded buffer and emits WebP renditions at several sizes, then
 * returns the set of variant URLs (relative to /uploads).
 */
export interface ImageVariants {
  master: string;
  large: string;
  medium: string;
  thumb: string;
  tiny: string;
}

const SIZES: Array<{ key: keyof ImageVariants; width: number; quality: number }> = [
  { key: "master", width: 2048, quality: 82 },
  { key: "large", width: 1280, quality: 80 },
  { key: "medium", width: 800, quality: 70 },
  { key: "thumb", width: 480, quality: 70 },
  { key: "tiny", width: 240, quality: 60 },
];

/**
 * @param input raw image bytes (jpg/png/webp/avif/etc.)
 * @param relDir  relative upload dir, e.g. "uploads/products/<productId>"
 * @param baseName base filename without extension
 */
export async function optimizeImage(
  input: Buffer,
  relDir: string,
  baseName: string
): Promise<ImageVariants> {
  const absDir = path.join(process.cwd(), "public", relDir);
  await mkdir(absDir, { recursive: true });

  const variants: ImageVariants = { master: "", large: "", medium: "", thumb: "", tiny: "" };

  for (const { key, width, quality } of SIZES) {
    const fileName = `${baseName}_${key}.webp`;
    const outPath = path.join(absDir, fileName);
    const buffer = await sharp(input)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality })
      .toBuffer();
    await sharp(buffer).toFile(outPath);
    variants[key] = `/${relDir}/${fileName}`;
  }

  return variants;
}