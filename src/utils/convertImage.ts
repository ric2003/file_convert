export type TargetFormat = "png" | "jpeg" | "webp";

const mimeTypeMap: Record<TargetFormat, string> = {
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export async function convertImage(
  file: File,
  targetFormat: TargetFormat,
  quality = 0.9,
): Promise<{ blob: Blob; url: string; filename: string }> {
  return new Promise((resolve, reject) => {
    const fileURL = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(fileURL);
        reject(new Error("Could not get canvas context."));
        return;
      }

      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(fileURL);

      const mimeType = mimeTypeMap[targetFormat];

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const newFilename = file.name.replace(/\.[^/.]+$/, "") + "." + targetFormat;
            resolve({
              blob,
              url: URL.createObjectURL(blob),
              filename: newFilename,
            });
          } else {
            reject(new Error("Canvas to Blob conversion failed."));
          }
        },
        mimeType,
        quality,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(fileURL);
      reject(new Error("Failed to load image."));
    };

    img.src = fileURL;
  });
}
