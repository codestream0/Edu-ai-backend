import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.route";
import documentRouter from "./routes/document.route";
import cookieParser from "cookie-parser";
import taskRouter from "./routes/task.route";

const app = express();

app.use(
    cors({
    origin: "http://localhost:3000",
    credentials: true
  })
)
app.use(cookieParser());

app.use(express.json());

app.get("/",(req,res)=>{
    res.json({
        message:"EDU AI API is running"
    });
});

app.use("/api/auth",authRouter)
app.use("/api/document",documentRouter)
app.use("/api/task",taskRouter)

export default app;
