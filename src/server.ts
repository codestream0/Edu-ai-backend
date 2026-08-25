import app from './app';

const Port = process.env.port || 5000;

app.listen(Port,()=>{
    console.log(`EDU AI is running on server ${Port} `);
    
})
