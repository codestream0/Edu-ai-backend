import User from "../models/user"
import { loginSchema, signupSchema } from "../validations/auth.validation"
import bcrypt from "bcrypt"
import { generateAceessToken,verifyAccessToken } from "../utils/jwt"


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
    const token = generateAceessToken(newUser.id)

    console.log(newUser)

    return({
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        createAt: newUser.createdAt,
        token,
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
    const token = generateAceessToken(existingUser.id)

    return({
        id: existingUser._id,
        fullName:existingUser.fullName,
        email:existingUser.email,
        createdAt:existingUser.createdAt,
        token,
    })

}