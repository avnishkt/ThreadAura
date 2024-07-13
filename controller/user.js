const apiError = require('../utils/apiError');
const User = require('../models/user');
const uploadCloudinary = require('../utils/cloudinary');
const { Response } = require('../utils/response');
const sender = require('../config/email');
const jwt = require('jsonwebtoken');
const fs = require('fs');



const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new apiError(404, "User not found");
        }

        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        console.log("Error at token generation", error);
        throw new apiError(500, "Something went wrong at token generation");
    }
};

const createUser = async (req, res) => {
    try {
        const { name, email, password, roles } = req.body;

        if ([name, email, password].some(field => field?.trim() === "")) {
            throw new apiError( "All fields are required");
        }

        const alreadyRegistered = await User.findOne({ email });
        if (alreadyRegistered) {
            throw new apiError( "User with this email already exists");
        }

        const avatarFilePath = req.file;
        if (!avatarFilePath) {
            throw new apiError( "Avatar file is required");
        }

        const avatar = await uploadCloudinary(avatarFilePath);
        if (!avatar) {
            throw new apiError( "Failed to upload avatar");
        }

        const user = await User.create({
            name,
            email,
            password,
            avatar: {
                public_id: avatar.public_id,
                url: avatar.url
            }
        });

        const createdUser = await User.findById(user._id).select("-password -refreshToken");
        if (!createdUser) {
            throw new apiError(500, "Failed to retrieve user");
        }

        const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id);
        const options = {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        };

        return res
            .status(201)
            .cookie('accessToken', accessToken, options)
            .cookie('token', refreshToken, options)
            .json(new Response(201, createdUser, "User registration successful"));

    } catch (error) {
     return res.json(error.message)
    }
};
const loginUser= async(req,res)=>{
    try {
        const {email,password} =req.body;
        console.log(req.body)
        if(!email)
        throw new apiError("All fields are quired");
          
         const user=await User.findOne({
            email
        })
        
        if(!user)
        throw new apiError("No such user exist in our data base ");
    
    const isPasswordvalid =await user.isPasswordCorrect(password);
    if(!isPasswordvalid) throw new apiError("invalid password");
    
    const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id)
     
    const logedInUser =await User.findById(user._id).select("-password,-refreshToken");
    
    const options ={
        httpOnly:true,
        secure:true
    }
    
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("token", refreshToken, options)
    .json(
        new Response(
            200, 
            {
                user: logedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    ) 
    } catch (error) {
        console.log(error.stack)
        return res.json({error:error.message,
            success:false
        })
    }
    

}

const refresh = async (req, res) => {
    if (!req?.cookies?.token) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(req.cookies.token, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const user = await User.findOne({ email: decoded.email }).lean().exec();
        if (!user) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const accessToken = jwt.sign({
            "userInfo": {
                "email": user.email,
                "roles": user.roles
            }
        }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });

        res.status(200).json({ accessToken });
    });
};
const userLogout = async (req, res) => {
    console.log(req.cookie); // Log cookies for debugging (optional)

    // Check if the cookie exists
    if (!req?.cookies?.token) {
        return res.sendStatus(204); // No Content: The client should continue to display the current document.
    }

    // Clear the cookie
    res.clearCookie('token', { 
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    });

    // Respond with a JSON message
    res.json({ message: 'Cookie cleared' });
};
const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            throw new apiError('Please provide a registered email');
        }
        
        const user = await User.findOne({ email }).lean().exec();
        if (!user) {
            throw new apiError('Forbidden');
        }

        const resetToken = jwt.sign(
            { userId: user._id },
            process.env.RESET_PASSWORD_SECRET,
            { expiresIn: '10m' }
        );

        const resetUrl = `${process.env.CLIENT_BASE_URL}/resetpassword/${resetToken}`;
        const forgotPasswordTemplate = fs.readFileSync('./public/emailtemplate/forgotPassword.html', 'utf8');
        const message = forgotPasswordTemplate.replace('resetUrlLink', resetUrl);

        await sender.sendMail({
            to: email,
            subject: 'Password Recovery',
            html: message
        });

        res.status(200).json({
            success: true,
            message: 'Email sent'
        });
    } catch (error) {
        console.error(error.stack);
        res.status(500).json({ error: error.message });
    }
};
    

const resetpassword=async(req,res)=>{
if(!req.params.resetToken)
    return next(new ErrorHandler("Invalid Token", 401));

const userInfo = jwt.verify(req.params.resetToken, process.env.RESET_PASSWORD_SECRET);

if (!userInfo)
    return new apiError("Invalid Token");

const user = await User.findById(userInfo.userId).exec();

if(!user)
    throw new apiError("User not found");

const { password } = req.body;

if (!password)
    throw new apiError("Password is required");


user.password = password;
await user.save();

res.status(200).json({
    success: true,
    message: 'Password updated'
})
};

module.exports = {
    createUser,
    loginUser,
    refresh,
    userLogout,
    forgetPassword,
    resetpassword
};
