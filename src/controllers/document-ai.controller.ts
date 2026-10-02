import { Response } from "express";

import { AuthRequest } from "../middleware/auth.middleware";

import DocumentModel from "../models/document";

import { summarizeDocument } from "../services/document-ai.service";

export const generateDocumentSummaryController = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const regenerate = req.query.regenerate === "true";

    const document = await DocumentModel.findOne({
      _id: id,
      owner: req.user?.userId,
    });

    if(document){
      console.log("Document found: ", document._id, document.title);
      console.log("Document extractedText: ", document.extractedText);
      console.log("Document summary: ", document.summary);
    }

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (!document.extractedText?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Document has not been processed yet",
      });
    }

    // Return the cached summary only when regeneration isn't requested.
    if (!regenerate && document.summary?.trim()) {
      return res.status(200).json({
        success: true,
        message: "Summary retrieved successfully",
        summary: document.summary,
        cached: true,
      });
    }

    // Generate a fresh summary when regenerate=true.
    const summary = await summarizeDocument(document._id.toString());

    return res.status(200).json({
      success: true,
      message: regenerate
        ? "Summary regenerated successfully"
        : "Summary generated successfully",
      summary,
      cached: false,
    });
  } catch (error) {
    console.error("Generate document summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate document summary",
    });
  }
};


