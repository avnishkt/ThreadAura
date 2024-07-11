const mongoose = require('mongoose');

const Schema = mongoose.Schema

const cartSchema = new Schema({
    cartItems:[{
        product:{
            type: mongoose.type.Schema.ObjectId,
            ref: "Product",
            required: true
        },
        variations:{
            image: {
                publicId: {
                    type: String,
                    required: true,
                },
                url: {
                    type: String,
                    required: true,
                }
            },
            size: {
               type: Number, 
            }
        },
        quantity:{
            type: Number,
            validate: (value) => value >= 1,
            default: 1
        },
        price:{
            type: Number,
            validate: (value) => value >= 0,
            required: true,
        },
        createdAt:{
            type: Date,
            default: Date.now()
        }
    }],
    createdBy:{
        type: mongoose.type.Schema.ObjectId,
        ref: "User",
        required: true
    },
    status:{
        type: String,
        enum: ["Pending", "Confirmed", "Canceled"],
        default: ["Pending"]
    }
},{timestamps: true})

module.exports = mongoose.model('Cart', cartSchema);