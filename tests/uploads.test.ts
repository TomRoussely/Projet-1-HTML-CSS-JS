import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { prepareImage, MAX_IMAGE_BYTES } from "../lib/uploads";

test("photo upload validates content and converts to bounded WebP", async () => {
  const input = await sharp({ create: { width: 2400, height: 1200, channels: 3, background: "green" } }).png().toBuffer();
  const result = await prepareImage(new File([new Uint8Array(input)], "photo.png", { type: "image/png" }));
  const metadata = await sharp(result).metadata();
  assert.equal(metadata.format, "webp");
  assert.equal(metadata.width, 1920);
  assert.equal(metadata.height, 960);
  await assert.rejects(prepareImage(new File(["not an image"], "fake.png", { type: "image/png" })), /illisible/);
  await assert.rejects(prepareImage(new File(["<svg></svg>"], "image.svg", { type: "image/svg+xml" })), /JPEG/);
  await assert.rejects(prepareImage(new File([new Uint8Array(MAX_IMAGE_BYTES + 1)], "large.jpg", { type: "image/jpeg" })), /5 Mo/);
});
