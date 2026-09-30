import type { NextRequest } from "next/server";
import { currentUser } from "@/lib/auth/guard";
import { optimizeImage } from "@/lib/images";
import { json, badRequest, unauthorized } from "@/lib/http";
import { randomBytes } from "crypto";

// Accepts multipart/form-data with one or more "file" fields. Sellers (and
// admins) use this to upload product photos, which are optimized into WebP
// renditions under /uploads/products and returned as URL sets.
export async function POST(request: NextRequest) {
  const user = await currentUser(request);
  if (!user) return unauthorized();

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return badRequest("Invalid upload");
  }

  const files = (form.getAll("file") as File[]).filter(
    (f) => f && typeof f === "object" && typeof (f as File).arrayBuffer === "function"
  );
  if (files.length === 0) return badRequest("No images selected");

  const MAX_FILES = 10;
  const MAX_BYTES = 10 * 1024 * 1024; // 10MB each
  if (files.length > MAX_FILES) return badRequest(`Maximum ${MAX_FILES} images per upload`);

  const uploaded: {
    url: string;
    master: string;
    large: string;
    medium: string;
    thumb: string;
    tiny: string;
  }[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) continue;
    const bytes = Buffer.from(await file.arrayBuffer());
    if (bytes.length === 0 || bytes.length > MAX_BYTES) continue;
    const baseName = `${Date.now().toString(36)}-${randomBytes(4).toString("hex")}`;
    const v = await optimizeImage(bytes, "uploads/products", baseName);
    uploaded.push({
      master: v.master,
      large: v.large,
      medium: v.medium,
      thumb: v.thumb,
      tiny: v.tiny,
      // "url" is the best stable display rendition (large).
      url: v.large,
    });
  }

  if (uploaded.length === 0) return badRequest("No valid images uploaded (must be jpg, png, webp…).");

  return json({ images: uploaded });
}

export const dynamic = "force-dynamic";