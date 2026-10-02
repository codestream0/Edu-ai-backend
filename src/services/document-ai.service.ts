import DocumentModel from "../models/document.model";
import { generateFinalSummary, summarizeChunk } from "./ai.service";
import { chunkText } from "./text-chunk.service";

export const summarizeDocument = async (
  documentId: string,
): Promise<string> => {
  const document = await DocumentModel.findById(documentId);

  if (!document) {
    throw new Error("Document not found");
  }

  if (!document.extractedText?.trim()) {
    throw new Error("Document does not contain extracted text");
  }

  const chunks = chunkText(document.extractedText, {
    chunkSize: 8000,
    overlap: 500,
  });

  if (chunks.length === 0) {
    throw new Error("No chunks were generated from the document");
  }

  console.log(`Summarizing ${chunks.length} document chunks...`);

  const chunkSummaries: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    console.log(`Summarizing chunk ${i + 1}/${chunks.length}...`);

    const summary = await summarizeChunk(chunks[i]);

    chunkSummaries.push(summary);
  }

  console.log("Generating final document summary...");

  const finalSummary = await generateFinalSummary(chunkSummaries);

  document.summary = finalSummary;

  await document.save();

  console.log("Document summary saved to MongoDB.");

  return finalSummary;
};
