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

    const document = await DocumentModel.findOne({
      _id: id,
      owner: req.user?.userId,
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    if (!document.extractedText?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Document has not been processed yet",
      });
    }

    if (document.summary?.trim()) {
      return res.status(200).json({
        success: true,
        message: "Document summary already exists",
        summary: document.summary,
      });
    }

    const summary = await summarizeDocument(
      document._id.toString(),
    );

    return res.status(200).json({
      success: true,
      message: "Document summarized successfully",
      summary,
    });
  } catch (error) {
    console.error(
      "Generate document summary error:",
      error,
    );

    return res.status(500).json({
      success: false,
      message: "Failed to generate document summary",
    });
  }
};