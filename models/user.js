const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        public_id: {
            type: String,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
    },
    roles: {
        User: {
            type: Number,
            default: 2001
        },
        Editor: Number,
        Admin: Number
    },
    refreshToken: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Method to check if password is correct
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

// Method to generate access token
userSchema.methods.generateAccessToken = function () {
    return jwt.sign( {"userInfo":{
        "email": this.email,
        "roles": this.roles
    }},
        process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    });
};

// Method to generate refresh token
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            email:this.email
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    );
};

module.exports = mongoose.model('User', userSchema);
