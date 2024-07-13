const nodemailer =require('nodemailer');
const dotenv=require('dotenv');
dotenv.config();
const sender =nodemailer.createTransport({
    service:"Gmail",
    auth:{
        user:process.env.EMAIL_ID,
        pass:process.env.EMAIL_PASS
    }

});

module.exports=sender;