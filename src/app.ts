import express from "express";
import cors from "cors";
import authRouter from "./routes/auth.routes";
import documentRouter from "./routes/document.routes";
import cookieParser from "cookie-parser";
import taskRouter from "./routes/task.routes";
import quizRouter from "./routes/quiz.routes";
import progressRouter from "./routes/progress.routes";
import chatRouter from "./routes/ai-chat.routes";

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
app.use("/api/quiz",quizRouter)
app.use("/api/progress",progressRouter)
app.use("/api/ai-chat",chatRouter)

export default app;
