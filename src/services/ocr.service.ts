import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync =
  promisify(execFile);

export const extractTextFromImage =
  async (
    imagePath: string,
  ): Promise<string> => {
    try {
      const { stdout } =
        await execFileAsync(
          "tesseract",
          [
            imagePath,
            "stdout",
            "-l",
            "eng",
          ],
          {
            maxBuffer:
              10 * 1024 * 1024,
          },
        );

      return stdout.trim();
    } catch (error: any) {
      console.error(
        "Tesseract OCR failed:",
      );

      console.error(
        error.stderr ||
          error.message,
      );

      throw new Error(
        `OCR failed: ${
          error.stderr ||
          error.message
        }`,
      );
    }
  };