const express =require("express");
const connectDb = require("./config/db");
const app =express();
const port =process.env.PORT||8080;

const serverEngine =()=>{
    connectDb();
    app.get('/',(req,res)=>{
        res.json({mesg:"This server is for ecomerce "})
    })
    app.listen(port,async()=>{
        console.log("the engine started succesfully ")
    })
}
serverEngine();

