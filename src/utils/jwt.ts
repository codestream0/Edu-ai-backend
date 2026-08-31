import jwt from "jsonwebtoken";

export const generateAceessToken = (userId:string)=>{
    return jwt.sign(
        {userId},
        process.env.JWT_SECRET as string,
        {expiresIn:"1m"}
    );

}

export const verifyAccessToken = (token:string)=>{
    return jwt.verify(
        token,
        process.env.JWT_SECRET as string,
    ) as {userId:string};
}