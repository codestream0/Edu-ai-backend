import express from "express";
import cors from "cors";

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

export default app;
