const apiError = require('../utils/apiError');
const User = require('../models/user');
const uploadCloudinary = require('../utils/cloudinary');
const { Response } = require('../utils/response');

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
            .cookie('refreshToken', refreshToken, options)
            .json(new Response(201, createdUser, "User registration successful"));

    } catch (error) {
     throw new apiError("Failed to create user")
    }
};
const loginUser= async(req,res)=>{
    const {email,password} =req.body;
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
.cookie("refreshToken", refreshToken, options)
.json(
    new Response(
        200, 
        {
            user: logedInUser, accessToken, refreshToken
        },
        "User logged In Successfully"
    )
)

}

const refresh = async (req, res) => {
    if (!req?.cookies?.jwt) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    jwt.verify(req.cookies.jwt, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
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

const userLogout = (req,res) => {
    if(!req?.cookies?.jwt) return res.sendStatus(204);
    res.clearCookie('jwt', { 
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    })
    res.json({ message: 'Cookie cleared' });
}


module.exports = {
    createUser,
    loginUser,
    refresh,
    userLogout
};
