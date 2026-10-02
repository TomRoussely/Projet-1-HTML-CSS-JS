import sharp from "sharp";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Decode and re-encode uploads: never trust a filename or serve original bytes. */
export async function prepareImage(file: File): Promise<Buffer> {
  if (file.size > MAX_IMAGE_BYTES)
    throw new Error("La photo doit peser au maximum 5 Mo.");
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Choisissez une photo JPEG, PNG ou WebP.");
  try {
    const image = sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 40_000_000,
    });
    const metadata = await image.metadata();
    if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format))
      throw new Error();
    return await image
      .rotate()
      .resize({
        width: 1920,
        height: 1920,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer();
  } catch {
    throw new Error(
      "Photo illisible ou trop grande en dimensions. Choisissez une autre image (40 mégapixels maximum).",
    );
  }
}
