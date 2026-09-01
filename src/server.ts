import dotenv from "dotenv";
import app from './app';
import connectDB from './config/db';

    console.log("ACCESS SECRET:", process.env.JWT_ACCESS_SECRET);
    console.log("REFRESH SECRET:", process.env.JWT_REFRESH_SECRET);

dotenv.config()
const Port = process.env.port || 3000;

const startServer = async ()=>{

    await connectDB();


    app.listen(Port,()=>{
    console.log(`EDU AI is running on server ${Port} `);
    
    })

}
startServer();
