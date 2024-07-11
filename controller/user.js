const apiError = require('../utils/apiError');
const User = require('../models/user');
const uploadCloudinary = require('../utils/cloudinary');
const { Response } = require('../utils/response');



const generateAccessTokenAndRefreshToken =async(userId)=>{
    try {
        const user =await User.findById(userId);
        const accessToken =user.generateAccessToken()
        const refreshToken =user.generateRefreshToken()
        user.refreshToken=refreshToken;
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken}

    } catch (error) {
        console.log("error at tokrn generation")
        throw new apiError("something went wrong at token generation")
    }
}


const createUser = async (req, res) => {

    try {
        const { name, email, password, roles } = req.body;
   
        if ([name, email, password].some(field => field?.trim() === "")) {
            throw new apiError( "All fields are required");
        }
    
        const alreadyRegistered = await User.findOne(email);
        if (alreadyRegistered) {
            throw new apiError( "User with email or username already exists");
        }
        const avatarFilePath =req.file;
        if (!avatarFilePath) {
            throw new apiError( "Avatar file is required");
        }
     const avatar =await uploadCloudinary(avatarFilePath);
if(!avatar)
    throw new apiError("Failed to upload");

const user = await User.create({
    name,
    email,
    password,
    avatar:avatar.url
    
})

const createdUser = await User.findById(user._id).select("-password -refreshToken");
if(!createdUser){
    throw new apiError("Failed to retrive usre");

}
const {accessToken,refreshToken}=await generateAccessTokenAndRefreshToken(user._id)
const options ={
    httpOnly:true,
    secure:true
}

return res
.status(201)
.cookie('accessToken',accessToken,options)
.cookie('refreshToken',refreshToken,options)
.json(new Response(200,createdUser,"user registration successfull"));
    } catch (error) {
        throw new apiError("Erro at user creation")
    }
   

}


module.exports={
    createUser
}