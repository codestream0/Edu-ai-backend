import DocumentModel from "../models/document";
import { chunkText } from "./text-chunk.service";

export const getDocumentChunks = async (
  documentId: string
): Promise<string[]> => {
  const document = await DocumentModel.findById(documentId);

  if (!document) {
    throw new Error("Document not found");
  }

  if (!document.extractedText?.trim()) {
    throw new Error(
      "Document does not have extracted text"
    );
  }

  return chunkText(document.extractedText, {
    chunkSize: 8000,
    overlap: 500,
  });
};