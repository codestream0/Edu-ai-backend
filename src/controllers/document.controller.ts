import { AuthRequest } from "../middleware/auth.middleware";
import {createDocument} from "../services/document.service";
import { Request, Response } from "express";
import DocumentModel from "../models/document";
import { calculatePageCount } from "../utils/document-pages";

export const uploadDocumentController = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadedDocument = await createDocument({
      userId: req.user!.userId,
      title: req.body.title || req.file.originalname,
      originalName: req.file.originalname,
      fileName: req.file.filename,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      pageCount: await calculatePageCount(req.file.path, req.file.originalname),
    });
    return res.status(201).json({
        success: true,
        message: "Document uploaded successfully",
        document: uploadedDocument
    });
  } catch (error) {
    return res.status(500).json({ 
        success: false,
        message: "Error uploading document"
    });
  }
};


export const getDocumentsController = async (req: AuthRequest, res: Response) => {
  try{
    const documents =await DocumentModel.find({ owner: req.user?.userId });
    res.status(200).json({ success: true, documents })
  }catch(error){
    console.error("Get document error: ",error);
    res.status(500).json({ success:false, message: "Failed to fetch documents" })
  }
}
