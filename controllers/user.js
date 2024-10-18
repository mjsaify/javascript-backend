import jwt from 'jsonwebtoken'
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import UserModel from '../models/user.js';
import { fileUploadCloudinary } from '../utils/fileUpload.js';
import { REFRESH_TOKEN_SECRET } from '../constants.js';


// utils
const generateAccessAndRefreshToken = async (user) => {
    try {
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        // only refreshToken will be save in database
        user.refreshToken = refreshToken;
        // By default, Mongoose validates the schema of a document before saving it to the database. This ensures that all required fields, are present. When you set validateBeforeSave: false, it skips this validation process which can be useful When you're confident that the data is already valid or want to bypass validation
        await user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating Access and Refresh token");
    }
}



const RegisterUser = asyncHandler(async (req, res) => {
    // get user data
    const { fullName, username, email, password } = req.body;

    // input validation
    if ([fullName, username, email, password].some((field) => field?.trim() === "")) {
        // throw new ApiError(statusCode, "message");
        throw new ApiError(400, "All Fields are Required");
    }


    // check if user already exist
    const isUserExist = await UserModel.findOne({
        $or: [{ username }, { email }],
    });

    if (isUserExist) {
        throw new ApiError(409, "Email or Username already Exist");
    };

    // check for imaages, avatar is compulsary (using optional chaining advance javascript)
    const avatarLocalPath = req.files?.avatar[0]?.path; // extracting file path before uploading image to cloud
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    // classic way to check
    let coverImageLocalPath;
    // check if req.files present, check if the coverImage is array, check if its length > 0 then assign file path to the variable
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar Image is Required");
    }

    // upload them on cloudinary, avatar
    const avatar = await fileUploadCloudinary(avatarLocalPath);
    const coverImage = await fileUploadCloudinary(coverImageLocalPath);

    // making check if avatar is uploaded on cloud because it is required
    if (!avatar) {
        throw new ApiError(409, "Avatar Image is Required");
    };

    // create user object - create entry in db
    const user = await UserModel.create({
        fullName,
        username: username.toLowerCase(),
        email,
        avatar: avatar.url, // storing cloudinary url of image
        coverImage: coverImage?.url || "", // if cover image present save it or else stay as empty
        password,
    })

    // check if user created successfully and remove password and refresh token field from response
    const isUserCreated = await UserModel.findById(user._id).select("-password -refreshToken");
    if (!isUserCreated) {
        throw new ApiError(500, "Something went wrong while registering");
    };

    // return response
    return res.status(201).json(
        // create new object
        new ApiResponse(200, isUserCreated, "Registration Successfull"),
    )
});


const LoginUser = asyncHandler(async (req, res) => {
    // get user data
    const { username, email, password } = req.body;

    // username or email
    // The incorrect logic throws an error if either field is missing.
    // if (!username || !email) {}

    // The correct logic throws an error only when both fields are missing.
    if (!(username || email)) {
        throw new ApiError(400, "Invalid Credentials");
    }

    // find the user
    const user = await UserModel.findOne({
        $or: [{ username }, { email }]
    });


    if (!user) {
        throw new ApiError(404, "User Doesn't Exist");
    }

    // password check
    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid Credentials");
    }

    // generate access and refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);
    const loggedinUser = await UserModel.findById(user._id).select("-password -refreshToken");

    // send tokens in cookies
    const cookieOptions = {
        httpOnly: true,
        secure: true
    };

    // return response
    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, cookieOptions)
        .json(new ApiResponse(
            200,
            {
                loggedinUser,
                accessToken,
                refreshToken
            },
            "You are loggedin"
        ))
});


const LogoutUser = asyncHandler(async (req, res) => {
    // reset refreshToken from db
    const userId = req.user.id;

    await UserModel.findByIdAndUpdate(userId, {
        $set: {
            refreshToken: ""
        },
    }, { new: true }) // returns updated field

    // remove cookies
    return res
        .status(200)
        .clearCookie("accessToken")
        .clearCookie("refreshToken")
        .json(new ApiResponse(
            200, {}, "You are logged out"
        ));
});


const refreshAccessToken = asyncHandler(async (req, res) => {
    const cookieHeader = req.headers.cookie;
    const incomingRefreshToken = cookieHeader.split(";")[1];

    if (incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized Request");
    };

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, REFRESH_TOKEN_SECRET);
        const user = await UserModel.findById(decodedToken.id);

        if (!user) throw new ApiError(401, "Invalid Refresh Token");

        if (incomingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "Expired Token, Please login to continue");
        }

        const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);

        const cookieOptions = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, cookieOptions)
            .cookie("refreshToken", refreshToken, cookieOptions)
            .json(new ApiResponse(
                200,
                { accessToken, refreshToken },
                "Access Token Refreshed"
            ))
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Token");
    }

})


export { RegisterUser, LoginUser, LogoutUser, refreshAccessToken };