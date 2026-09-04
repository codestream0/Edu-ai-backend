import jwt from "jsonwebtoken";

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;

if (!accessSecret) {
  throw new Error("JWT_ACCESS_SECRET is not defined");
}

if (!refreshSecret) {
  throw new Error("JWT_REFRESH_SECRET is not defined");
}

export const generateAceessToken = (userId:string)=>{
    return jwt.sign(
        {userId},
        accessSecret,
        {expiresIn:"5m"}
    );

}

export const generateRefreshToken = (userId:string)=>{
    return jwt.sign(
        {userId},
        refreshSecret,
        {expiresIn:"3m"}
    )

}

export const verifyAccessToken = (token:string)=>{
    return jwt.verify(
        token,
        accessSecret,
    ) as {userId:string};
}

export const verifyRefreshToken = (token:string)=> {
    return jwt.verify(
        token,
        refreshSecret,
    ) as {userId: string}
}