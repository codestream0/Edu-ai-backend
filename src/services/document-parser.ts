import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

import { extractTextFromImages } from "./ocr.service";

const execFileAsync = promisify(execFile);

interface ParsedDocument {
  text: string;
  pageCount: number | null;
}

export const extractDocumentText = async (
  filePath: string,
  fileType: string
): Promise<ParsedDocument> => {
  const extension = path.extname(filePath).toLowerCase();

  switch (extension) {
    case ".pdf":
      return extractPdfText(filePath);

    case ".docx":
      return extractOfficeDocumentText(filePath);

    case ".pptx":
      return extractOfficeDocumentText(filePath);

    default:
      throw new Error(
        `Unsupported document type: ${fileType || extension}`
      );
  }
};

/**
 * PDF → PNG images → OCR
 */
const extractPdfText = async (
  filePath: string
): Promise<ParsedDocument> => {
  const tempDir = await createTempDirectory();

  try {
    const imagePaths = await convertPdfToImages(
      filePath,
      tempDir
    );

    const text = await extractTextFromImages(imagePaths);

    return {
      text: text.trim(),
      pageCount: imagePaths.length || null,
    };
  } finally {
    await fs.rm(tempDir, {
      recursive: true,
      force: true,
    });
  }
};

/**
 * DOCX/PPTX → PDF → PNG images → OCR
 */
const extractOfficeDocumentText = async (
  filePath: string,
  ): Promise<ParsedDocument> => {
  const tempDir = await createTempDirectory();

  try {
    const pdfPath = await convertOfficeDocumentToPdf(
      filePath,
      tempDir
    );

    const imagePaths = await convertPdfToImages(
      pdfPath,
      tempDir
    );

    const text = await extractTextFromImages(imagePaths);

    return {
      text: text.trim(),
      pageCount: imagePaths.length || null,
    };
  } finally {
    await fs.rm(tempDir, {
      recursive: true,
      force: true,
    });
  }
};

/**
 * Convert PDF pages into PNG images using Poppler.
 */
const convertPdfToImages = async (
  pdfPath: string,
  outputDir: string
): Promise<string[]> => {
  const outputPrefix = path.join(
    outputDir,
    "page"
  );

  await execFileAsync("pdftoppm", [
    "-png",
    "-r",
    "200",
    pdfPath,
    outputPrefix,
  ]);

  const files = await fs.readdir(outputDir);

  return files
    .filter(
      (file) =>
        file.startsWith("page-") &&
        file.endsWith(".png")
    )
    .sort((a, b) => {
      const pageA = extractPageNumber(a);
      const pageB = extractPageNumber(b);

      return pageA - pageB;
    })
    .map((file) =>
      path.join(outputDir, file)
    );
};

/**
 * Convert DOCX/PPTX to PDF using LibreOffice.
 */
const convertOfficeDocumentToPdf = async (
  filePath: string,
  outputDir: string
): Promise<string> => {
  const originalName = path.basename(
    filePath,
    path.extname(filePath)
  );

  const pdfPath = path.join(
    outputDir,
    `${originalName}.pdf`
  );

  console.log("Converting office document:");
  console.log("Input:", filePath);
  console.log("Output:", pdfPath);

  try {
    await execFileAsync("libreoffice", [
      "--headless",
      "--convert-to",
      "pdf",
      "--outdir",
      outputDir,
      filePath,
    ]);

    // Check that LibreOffice actually created the PDF
    await fs.access(pdfPath);

    console.log("LibreOffice conversion successful:");
    console.log(pdfPath);

    return pdfPath;
  } catch (error: any) {
    console.error("LibreOffice conversion failed");
    console.error("Input:", filePath);
    console.error("Output:", outputDir);
    console.error("stdout:", error.stdout);
    console.error("stderr:", error.stderr);
    console.error("message:", error.message);

    throw new Error(
      `LibreOffice failed to convert the document to PDF: ${
        error.stderr || error.message
      }`
    );
  }
};

/**
 * Extract numeric page number from generated PNG.
 */
const extractPageNumber = (
  fileName: string
): number => {
  const match = fileName.match(
    /page-(\d+)\.png$/
  );

  return Number(match?.[1] ?? 0);
};

/**
 * Create a temporary directory for document processing.
 */
const createTempDirectory = async (): Promise<string> => {
  const tempBase = path.join(
    process.cwd(),
    "temp",
    "documents"
  );

  await fs.mkdir(tempBase, {
    recursive: true,
  });

  return fs.mkdtemp(
    path.join(tempBase, "document-")
  );
};