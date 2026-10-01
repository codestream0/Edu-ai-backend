import fs from "fs/promises";
import path from "path";
import { execFile } from "child_process";
import { promisify } from "util";

import { extractTextFromImage } from "./ocr.service";

const execFileAsync = promisify(execFile);

interface ParsedDocument {
  text: string;
  pageCount: number | null;
}

export const extractDocumentText = async (
  filePath: string,
  fileType: string,
  onPageProcessed?: (
    currentPage: number,
    totalPages: number,
  ) => Promise<void>,
): Promise<ParsedDocument> => {
  const extension = path
    .extname(filePath)
    .toLowerCase();

  switch (extension) {
    case ".pdf":
      return extractPdfText(
        filePath,
        onPageProcessed,
      );

    case ".docx":
      return extractOfficeDocumentText(
        filePath,
        onPageProcessed,
      );

    case ".pptx":
      return extractOfficeDocumentText(
        filePath,
        onPageProcessed,
      );

    default:
      throw new Error(
        `Unsupported document type: ${
          fileType || extension
        }`,
      );
  }
};

/**
 * PDF → one PNG page at a time → OCR
 */
const extractPdfText = async (
  filePath: string,
  onPageProcessed?: (
    currentPage: number,
    totalPages: number,
  ) => Promise<void>,
): Promise<ParsedDocument> => {
  const tempDir =
    await createTempDirectory();

  try {
    const pageCount =
      await getPdfPageCount(filePath);

    console.log(
      `PDF contains ${pageCount} pages.`,
    );

    const extractedTexts: string[] = [];

    for (
      let page = 1;
      page <= pageCount;
      page++
    ) {
      console.log(
        `OCR processing page ${page}/${pageCount}...`,
      );

      const imagePath =
        await convertPdfPageToImage(
          filePath,
          tempDir,
          page,
        );

      try {
        const text =
          await extractTextFromImage(
            imagePath,
          );

        if (text.trim()) {
          extractedTexts.push(
            `PAGE ${page}\n${text.trim()}`,
          );
        }

        console.log(
          `OCR completed page ${page}/${pageCount}`,
        );

        if (onPageProcessed) {
          await onPageProcessed(
            page,
            pageCount,
          );
        }
      } finally {
        // Delete the PNG immediately after OCR.
        await fs.rm(imagePath, {
          force: true,
        });
      }
    }

    return {
      text: extractedTexts
        .join("\n\n")
        .trim(),

      pageCount,
    };
  } finally {
    await fs.rm(tempDir, {
      recursive: true,
      force: true,
    });
  }
};

/**
 * DOCX/PPTX → PDF → one PNG page at a time → OCR
 */
const extractOfficeDocumentText = async (
  filePath: string,
  onPageProcessed?: (
    currentPage: number,
    totalPages: number,
  ) => Promise<void>,
): Promise<ParsedDocument> => {
  const tempDir =
    await createTempDirectory();

  try {
    const pdfPath =
      await convertOfficeDocumentToPdf(
        filePath,
        tempDir,
      );

    return await extractPdfText(
      pdfPath,
      onPageProcessed,
    );
  } finally {
    await fs.rm(tempDir, {
      recursive: true,
      force: true,
    });
  }
};

/**
 * Get the number of pages in a PDF.
 */
const getPdfPageCount = async (
  filePath: string,
): Promise<number> => {
  const { stdout } =
    await execFileAsync(
      "pdfinfo",
      [filePath],
    );

  const match = stdout.match(
    /Pages:\s+(\d+)/,
  );

  if (!match) {
    throw new Error(
      "Could not determine PDF page count",
    );
  }

  return Number(match[1]);
};

/**
 * Convert ONLY ONE PDF page to PNG.
 *
 * We use 150 DPI to reduce processing time
 * and memory usage for large documents.
 */
const convertPdfPageToImage = async (
  pdfPath: string,
  outputDir: string,
  pageNumber: number,
): Promise<string> => {
  const outputPrefix =
    path.join(
      outputDir,
      `page-${pageNumber}`,
    );

  await execFileAsync(
    "pdftoppm",
    [
      "-png",

      // OCR resolution.
      "-r",
      "150",

      // First page to convert.
      "-f",
      String(pageNumber),

      // Last page to convert.
      "-l",
      String(pageNumber),

      // Generate exactly one image.
      "-singlefile",

      pdfPath,
      outputPrefix,
    ],
  );

  return `${outputPrefix}.png`;
};

/**
 * Convert DOCX/PPTX → PDF using LibreOffice.
 */
const convertOfficeDocumentToPdf =
  async (
    filePath: string,
    outputDir: string,
  ): Promise<string> => {
    const originalName =
      path.basename(
        filePath,
        path.extname(filePath),
      );

    const pdfPath =
      path.join(
        outputDir,
        `${originalName}.pdf`,
      );

    console.log(
      "Converting office document:",
    );

    console.log(
      "Input:",
      filePath,
    );

    console.log(
      "Output:",
      pdfPath,
    );

    try {
      await execFileAsync(
        "libreoffice",
        [
          "--headless",
          "--convert-to",
          "pdf",
          "--outdir",
          outputDir,
          filePath,
        ],
      );

      // Make sure LibreOffice actually
      // created the PDF.
      await fs.access(pdfPath);

      console.log(
        "LibreOffice conversion successful:",
      );

      console.log(pdfPath);

      return pdfPath;
    } catch (error: any) {
      console.error(
        "LibreOffice conversion failed",
      );

      console.error(
        "Input:",
        filePath,
      );

      console.error(
        "Output:",
        outputDir,
      );

      console.error(
        "stdout:",
        error.stdout,
      );

      console.error(
        "stderr:",
        error.stderr,
      );

      console.error(
        "message:",
        error.message,
      );

      throw new Error(
        `LibreOffice failed to convert the document to PDF: ${
          error.stderr ||
          error.message
        }`,
      );
    }
  };

/**
 * Create a temporary directory for
 * document processing.
 */
const createTempDirectory =
  async (): Promise<string> => {
    const tempBase =
      path.join(
        process.cwd(),
        "temp",
        "documents",
      );

    await fs.mkdir(
      tempBase,
      {
        recursive: true,
      },
    );

    return fs.mkdtemp(
      path.join(
        tempBase,
        "document-",
      ),
    );
  };