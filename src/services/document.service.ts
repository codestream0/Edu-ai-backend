import DocumentModel from '../models/document';
import { extractDocumentText } from './document-parser';

interface Document {
    userId: string;
    title: string;
    originalName: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    pageCount: number | null;
}

export const createDocument = async (documentData: Document) => {
    const uploadedDocument = await DocumentModel.create({
        owner: documentData.userId,
        title: documentData.title,
        originalName: documentData.originalName,
        fileName: documentData.fileName,
        fileUrl: documentData.fileUrl,
        fileType: documentData.fileType,
        fileSize:documentData.fileSize,
        pageCount: documentData.pageCount,
    });
    return uploadedDocument;
}


export const processDocument = async (documentId: string) => {

    const document = await DocumentModel.findById(documentId);
    if (!document) {
        throw new Error('Document not found');
    }

    try{

        document.status  = 'processing';
        await document.save();

        const result = await extractDocumentText(document.fileUrl, document.fileType);

        if(!result || !result.text){
            throw new Error('Failed to extract text from the document');
        }
        console.log(`Document ${documentId} processed successfully,Extracted text length: ${result.text.length}`);

        document.extractedText = result.text;
        document.pageCount = result.pageCount;
        document.status = 'completed';
        await document.save();
        return document;

    }catch(error){
        document.status = "failed";
        await document.save();

        console.error(
        `Failed to process document ${documentId}:`,
        error
        );

        throw error;
    }

}