import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.route";

const app = express();

app.use(
    cors({
    origin: "http://localhost:3000",
    credentials: true
  })
)

app.use(express.json());

app.get("/",(req,res)=>{
    res.json({
        message:"EDU AI API is running"
    });
});

app.use("/api/auth",authRouter)

export default app;
