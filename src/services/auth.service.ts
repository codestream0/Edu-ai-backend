import User from "../models/user"
import { loginSchema, signupSchema } from "../validations/auth.validation"
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
    console.log(newUser)

    return({
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        createAt: newUser.createdAt,
    })

}


export const login = async (data:unknown)=>{
    const validateData = loginSchema.parse(data);
    const { email,password } = validateData; 

    const existingUser = await User.findOne({ email });
    if (!existingUser){
        throw new Error("User credentials not found ");
    }
    const isPasswordValid = await bcrypt.compare(password,existingUser.password);
    
    if (!isPasswordValid){
        throw new Error("User password is invalid");
    }
    console.log(existingUser)

    return({
        id: existingUser._id,
        fullName:existingUser.fullName,
        email:existingUser.email,
        createdAt:existingUser.createdAt,
    })

}