import User from "../models/user"
import { signupSchema } from "../validations/auth.validation"
import bcrypt from "bcrypt"


export const signup = async (data:unknown) => {
    const validateData = signupSchema.parse(data)

    const{ fullName,email,password } = validateData;

    const existingUser = await User.findOne({ email });

    if(existingUser){
        throw new Error("User already exist");
    }
    
    const hashPassword = await bcrypt.hash(password,12)

    const newUser = await User.create({
        fullName,
        email,
        password: hashPassword,
    })

    return({
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        createAt: newUser.createdAt,
    })

}