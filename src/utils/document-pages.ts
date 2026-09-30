import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);

/**
 * Read a document's stored page count. PDF page totals are read with Poppler's
 * pdfinfo utility. Office files are ZIP archives: PowerPoint pages correspond
 * to slides, while Word's app properties may contain a page total saved by Word.
 */
export const calculatePageCount = async (
  filePath: string,
  originalName: string,
): Promise<number | null> => {
  const extension = path.extname(originalName).toLowerCase();

  if (extension === ".pdf") {
    const { stdout } = await execFileAsync("pdfinfo", [filePath]);
    const match = stdout.match(/^Pages:\s+(\d+)\s*$/m);
    if (!match) throw new Error("Could not read the PDF page count");
    return Number(match[1]);
  }

  if (extension === ".pptx") {
    const { stdout } = await execFileAsync("unzip", ["-Z1", filePath]);
    const slides = stdout.match(/^ppt\/slides\/slide\d+\.xml$/gm) ?? [];
    if (slides.length === 0) throw new Error("The presentation has no slides");
    return slides.length;
  }

  if (extension === ".docx") {
    const { stdout } = await execFileAsync("unzip", ["-p", filePath, "docProps/app.xml"]);
    const match = stdout.match(/<Pages>(\d+)<\/Pages>/i);
    return match ? Number(match[1]) : null;
  }

  throw new Error(`Unsupported document type: ${extension}`);
};
