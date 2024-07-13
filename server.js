const express = require("express");
const bodyParser = require('body-parser');
const connectDb = require("./config/db");
const upload = require("./middleware/multer");
const userRoute = require('./routes/v1/user');
const cookieParser =require('cookie-parser')
const { createUser } = require("./controller/user");

const app = express();
const port = process.env.PORT || 8080;

const serverEngine = () => {
    connectDb();
    app.use(cookieParser()); 
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use('/api', userRoute);

    app.post('/', upload.single('avatar'), createUser);
    app.get('/', (req, res) => {
        res.json({ mesg: "This server is for e-commerce" });
    });

    app.listen(port, async () => {
        console.log("The engine started successfully");
    });
}

serverEngine();
