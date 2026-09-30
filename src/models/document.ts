import Mongoose,{Document,Schema} from "mongoose";

export interface IDocument extends Document{
    owner:Mongoose.Types.ObjectId,
    title:string,
    originalName:string,
    fileName:string,
    fileUrl:string,
    fileType:string,
    fileSize:number,
    pageCount:number | null,
    extractedText?:string,
    status:"uploaded"|"processing"|"completed"|"failed",
    createdAt:Date,
    updatedAt:Date,
};

const documentSchema = new Schema<IDocument>(
    {
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User",
            required:true,
        },
        title:{
            type:String,
            required:true,  
            trim:true,
        },
        originalName:{
            type:String,
            required:true,
        },
        fileName:{
            type:String,
            required:true,
        },
        fileUrl:{
            type:String,
            required:true,
        },
        fileType:{
            type:String,
            required:true,
        },
        fileSize:{
            type:Number,
            required:true,
        },
        pageCount:{
            type:Number,
            default:null,
            min:1,
        },
        extractedText:{
            type:String,
        },
        status:{
            type:String,
            enum:["uploaded","processing","completed","failed"],
            default:"uploaded",
        },
        createdAt:{
            type:Date,
            default:Date.now,
        },
        updatedAt:{
            type:Date,
            default:Date.now,
        },
    },
    {
        timestamps:true,
    }
)

const DocumentModel = Mongoose.model<IDocument>("Document",documentSchema);

export default DocumentModel;
