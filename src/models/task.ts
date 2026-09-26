import mongoose,{Document,Schema} from "mongoose";

export interface ITask extends Document{
    title:string,
    description:string,
    status:string,
    priority:string,
    dueDate?:Date,
    createdAt:Date,
    updatedAt:Date,
}

const taskSchema:Schema = new Schema<ITask>({
    title:{type:String,required:true},
    description:{type:String,required:true},
    status:{type:String,required:true,enum:["pending","in-progress","completed"]},
    priority:{type:String,required:true,enum:["low","medium","high"]},
    dueDate:{type:Date},
    createdAt:{type:Date,default:Date.now},
    updatedAt:{type:Date,default:Date.now}
})

const Task = mongoose.model<ITask>("Task",taskSchema);
export default Task;