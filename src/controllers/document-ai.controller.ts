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
    console.log("\n==============================");
    console.log("SUMMARY REQUEST");
    console.log("==============================");

    console.log("URL document ID:", id);
    console.log("Authenticated user:", req.user?.userId);
    const document = await DocumentModel.findOne({
      _id: id,
      owner: req.user?.userId,
    });

    console.log("Document found:", Boolean(document));

    if (document) {
      console.log("MongoDB document ID:", document._id.toString());
      console.log("Document owner:", document.owner.toString());
      console.log("Document status:", document.status);
      console.log(
        "Extracted text length:",
        document.extractedText?.length ?? 0,
      );
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

    if (document.summary?.trim()) {
      return res.status(200).json({
        success: true,
        message: "Document summary already exists",
        summary: document.summary,
      });
    }

    const summary = await summarizeDocument(document._id.toString());

    return res.status(200).json({
      success: true,
      message: "Document summarized successfully",
      summary,
    });
  } catch (error) {
    console.error("Generate document summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to generate document summary",
    });
  }
};
