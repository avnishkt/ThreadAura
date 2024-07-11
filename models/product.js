const mongoose = require('mongoose')
const Schema = mongoose.Schema

const productSchema = new Schema({
    category:{
        type: mongoose.Schema.type.ObjectId,
        ref: "Category"
    },
    title:{
        type: String,
        required: true
    },
    images:[{
        publicId:{
            type: String,
            required: true,
        },
        url:{
            type:String,
            required: true
        }
    }],
    summary:{
        type: String,
        required: true
    },
    desc:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    discountType:{
        type: String,
        enum: ["none", "percent", "amount"],
        required: true
    },
    discountValue:{
        type: Number
    },
},{timestamps: true})

module.exports = mongoose.model("Product", productSchema)