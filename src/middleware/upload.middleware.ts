import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(
  process.cwd(),
  "uploads",
  "documents"
);

// Create upload directory if it does not exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure where files will be stored
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9);

    const extension = path.extname(file.originalname).toLowerCase();

    cb(null, `${uniqueSuffix}${extension}`);
  },
});

// Allowed file extensions and MIME types
const allowedMimeTypes = [
  "application/pdf",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const allowedExtensions = [".pdf", ".docx", ".pptx"];

// Validate uploaded files
const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const isAllowedMime = allowedMimeTypes.includes(file.mimetype);
  const isAllowedExtension = allowedExtensions.includes(extension);

  if (isAllowedMime && isAllowedExtension) {
    cb(null, true);
  } else {
    cb(
      new Error("Only PDF, DOCX, and PPTX files are allowed.")
    );
  }
};

// Configure Multer
export const uploadMiddleware = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
});