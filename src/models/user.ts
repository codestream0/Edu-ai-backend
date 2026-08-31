import mongoose,{Document,Schema} from "mongoose";

export interface IUser extends Document{
    fullName:string,
    email:string,
    password:string,
    createdAt:Date,
    updatedAt:Date,
}

const userSchema =new Schema<IUser>(
    {
        fullName:{
            type:String,
            required:true,
            trim: true,
            minLength: 2,
            maxLength:100,
        },
        email:{
            type: String,
            required: true,
            trim: true,
            unique: true,
            lowercase:true,
        },
        password:{
            type: String,
            required: true,
            minLength: 6,
        },

    },
    {
        timestamps:true,
    }
)

const User = mongoose.model<IUser>("user",userSchema)

export default User;
