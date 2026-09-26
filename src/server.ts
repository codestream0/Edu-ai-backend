import dotenv from "dotenv";
import app from './app';
import connectDB from './config/db';


dotenv.config()
const Port = process.env.PORT || 3000;

const startServer = async ()=>{

    await connectDB();


    app.listen(Port,()=>{
    console.log(`EDU AI is running on server ${Port} `);
    
    })

}
startServer();
