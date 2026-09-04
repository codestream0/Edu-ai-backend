import DOcumentModel from '../models/document';

interface Document {
    userId: string;
    title: string;
    originalName: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
}

export const createDocument = async (documentData: Document) => {
    const uploadedDocument = await DOcumentModel.create({
        owner: documentData.userId,
        title: documentData.title,
        originalName: documentData.originalName,
        fileName: documentData.fileName,
        fileUrl: documentData.fileUrl,
        fileType: documentData.fileType,
        fileSize:documentData.fileSize,
    });
    return uploadedDocument;
}

