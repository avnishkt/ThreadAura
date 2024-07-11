const dotenv = require('dotenv');

const mongoose = require('mongoose');
const apiError = require('../utils/apiError');

const connectDb = async () => {
    try {
        await mongoose.connect("mongodb+srv://avnish:789789@cluster0.ybrjqou.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0", {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        })
        console.log("Databse connected");

    } catch (error) {
        console.log('error at db connection', error);
        throw new apiError('databse not connected')
    }
}
module.exports = connectDb
