const express =require("express");
const bodyParser = require('body-parser');
const connectDb = require("./config/db");
const upload = require("./middleware/multer");
const { createUser } = require("./controller/user");
const app =express();
const port =process.env.PORT||8080;

const serverEngine =()=>{
    connectDb();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended:true}));
 app.post('/',upload.single('avatar'),createUser)
    app.get('/',(req,res)=>{
        res.json({mesg:"This server is for ecomerce "})
    })

    app.listen(port,async()=>{
        console.log("the engine started succesfully ")
    })
}
serverEngine();

