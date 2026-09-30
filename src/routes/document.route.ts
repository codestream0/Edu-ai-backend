import {Router} from 'express';
import { uploadDocumentController,getDocumentsController, getDocumentById, deleteDocumentById } from '../controllers/document.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
const documentRouter = Router();

documentRouter.post('/upload', authMiddleware, uploadMiddleware.single('document'), uploadDocumentController);
documentRouter.get("/get-documents",authMiddleware,getDocumentsController)
documentRouter.get("/:id",authMiddleware,getDocumentById)
documentRouter.delete("/:id",authMiddleware,deleteDocumentById)
export default documentRouter;