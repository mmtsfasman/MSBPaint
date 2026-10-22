import { getCanvas } from "./canvas";

export function exportAsPNG(): void {
  const canvas = getCanvas();
  download(canvas.toDataURL("image/png"), defaultFilename("png"));
}

// quality is 0 to 1, as accepted by canvas.toDataURL
export function exportAsJPEG(quality = 0.92): void {
  const canvas = getCanvas();
  download(canvas.toDataURL("image/jpeg", quality), defaultFilename("jpg"));
}

export function exportAsBMP(): void {
  const canvas = getCanvas();
  const ctx = canvas.getContext("2d")!;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const blob = new Blob([encodeBMP(data, canvas.width, canvas.height)], {
    type: "image/bmp",
  });
  const url = URL.createObjectURL(blob);
  download(url, defaultFilename("bmp"));
  URL.revokeObjectURL(url);
}

// Encodes RGBA pixels as an uncompressed 24-bit BMP. Browsers cannot
// produce BMP from canvas.toBlob, so the file is built by hand.
export function encodeBMP(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
): ArrayBuffer {
  const rowSize = Math.ceil((width * 3) / 4) * 4;
  const pixelBytes = rowSize * height;
  const headerSize = 14 + 40;
  const buffer = new ArrayBuffer(headerSize + pixelBytes);
  const view = new DataView(buffer);

  // BITMAPFILEHEADER
  view.setUint8(0, 0x42); // "B"
  view.setUint8(1, 0x4d); // "M"
  view.setUint32(2, buffer.byteLength, true);
  view.setUint32(10, headerSize, true);

  // BITMAPINFOHEADER
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, height, true); // positive height: rows stored bottom-up
  view.setUint16(26, 1, true); // colour planes
  view.setUint16(28, 24, true); // bits per pixel
  view.setUint32(34, pixelBytes, true);
  view.setInt32(38, 2835, true); // 72 DPI horizontal
  view.setInt32(42, 2835, true); // 72 DPI vertical

  const pixels = new Uint8Array(buffer, headerSize);
  for (let y = 0; y < height; y++) {
    const rowStart = (height - 1 - y) * rowSize;
    for (let x = 0; x < width; x++) {
      const src = (y * width + x) * 4;
      const dst = rowStart + x * 3;
      pixels[dst] = rgba[src + 2];
      pixels[dst + 1] = rgba[src + 1];
      pixels[dst + 2] = rgba[src];
    }
  }

  return buffer;
}

function defaultFilename(extension: string): string {
  // e.g. masterpiece-2026-10-22T15-18-28.png
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
  return `masterpiece-${timestamp}.${extension}`;
}

function download(href: string, filename: string): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = href;
  link.click();
}
