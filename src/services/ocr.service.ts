import { createWorker } from "tesseract.js";

export const extractTextFromImages = async (
  imagePaths: string[]
): Promise<string> => {
  if (imagePaths.length === 0) {
    return "";
  }

  const worker = await createWorker("eng");

  try {
    const extractedTexts: string[] = [];

    for (const imagePath of imagePaths) {
      const {
        data: { text },
      } = await worker.recognize(imagePath);

      if (text.trim()) {
        extractedTexts.push(text.trim());
      }
    }

    return extractedTexts.join("\n\n");
  } finally {
    await worker.terminate();
  }
};