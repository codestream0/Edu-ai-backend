import { AuthRequest } from "../middleware/auth.middleware";
import {createDocument} from "../services/document.service";
import { Request, Response } from "express";
import DocumentModel from "../models/document";
import { calculatePageCount } from "../utils/document-pages";
import { processDocument } from "../services/document.service";

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
      fileUrl: req.file.path,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
      pageCount: await calculatePageCount(req.file.path, req.file.originalname),
    });

    processDocument(uploadedDocument._id.toString()).catch(
      (error: Error) => {
        console.error(
          `Failed to process document ${uploadedDocument._id}:`,
          error
        );
      }
    );

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


export const getDocumentById = async (req: AuthRequest, res: Response) =>{
  try{
    const document = await DocumentModel.findOne({ _id: req.params.id, owner:req.user?.userId });
    if(!document){
      res.status(404).json({ success: false, message: "document not found" })
    }
    res.status(200).json({ success: true, document })
  }catch(error){
    console.error("Get document by ID error: ", error)
    res.status(500).json({ success: false, message: "failed to fetch document" })
  }
}

export const deleteDocumentById = async (req: AuthRequest, res: Response)=>{
  try{
    const document = await DocumentModel.deleteOne({_id: req.params.id, owner: req.user?.userId});
    if(!document){
      res.status(404).json({ success:false, message: "document not found" });
    }
    res.status(200).json({ success: true, message : "document deleted successfully" ,document})

  }catch(error){
    console.log("Delete{{ document error");
    res.status(500).json({ success:false, message: "Failed to delete document" })
  }
}