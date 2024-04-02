import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const generateAccessAndRefreshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false})

        return {accessToken, refreshToken}
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

// to secure with http

const options = {
    httpOnly : true,
    secure : true
}
const registerUser = asyncHandler(async(req,res) =>{
    // get user details from frontend/ form(postman)
    // validation - not empty
    // check if user already exist (username || email)
    // check for images , check for avatar -> upload to cloudinary
    // check for cover if upload them to cloudinary 
    // create user object -> create entry in DB
    // remove password and refresh token field from response
    // check for user creation
    // return response

    const { email , username , fullName , password } = req.body
    // console.log("username is : ", username,email,fullName,password)


    // check multiple fields using some
    if ([ fullName, email, username, password ].some((field) => field?.trim() === "" )) 
    {
        throw new ApiError(400, "All files are required")
    }
    
    //$ dollar operator is used for logic gate operations (or , nor , and etc)
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "username or User with email is already exists")
    }

    // console.table(req.body, req.files)

    const avatarLocalPath = req.files?.avatar[0]?.path;

    // const coverImgLocalPath = req.files?.coverImage[0]?.path;

    // if coverImage doesn't upload then above optinal chaining may not work, so go traditional
    let coverImgLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0 ){
        coverImgLocalPath = req.files.coverImage[0].path;
    }




    if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
   }

   const avatar = await uploadOnCloudinary(avatarLocalPath);
   const coverImage = await uploadOnCloudinary(coverImgLocalPath);

   if(!avatar){
    throw new ApiError(400, "Avatar file / profile Image is required")
   }

   // object creation for DB entry

   const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email, 
    password,
    username: username.toLowerCase()
})

   // checking the user creating by using findById method
   // After creation , we remove password and refreshToken ,By using select method with "-attr1 -attr2" 
    const  userCreated =  await User.findById(user._id).select(
       "-password -refreshToken"
    )

    if(!userCreated){
        throw new ApiError(500, "Something went wrong while registering by the User")
    }

    return res.status(201).json(
        new ApiResponse(200, userCreated, "User Successfully Created !!!!")
    )

})

const loginUser = asyncHandler( async (req,res) => {
    // get data from -> req.body  
    // get the username or email
    // find username or email
    // Password check 
    // access and refresh token generate
    // sent token through secure cookies  

    const {email, username, password} = req.body;

    // if(!(username || email)){
    //     throw new ApiError(400, "username or email is required")
    // }
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const existedUser = await User.findOne({ $or :[{ username },{ email }]})

    if(!existedUser){
        throw new ApiError(404, "user  is not registered or user doesn't exist")
    }

    const isPasswordValid = await existedUser.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid User Credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(existedUser._id) 
    
    const userLogged = await User.findById(existedUser._id).select("-password -refreshToken");

    // for secure login 

    const options = {
        httpOnly : true,
        secure: true
    }

    // response (send cookie)

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: userLogged, accessToken, refreshToken
            },
            "user loggedIn Successfully !!"
        )
    )

})


// logout user

const userLogout = asyncHandler(async(req, res) => {
    // middleware (multer) 
    await User.findByIdAndUpdate(
        req.user._id,
        {
          $unset : {
            refreshToken : 1 // this removes the field from document
          }   
        },
        {
            new : true
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logout Suceessfully"))


})

//refreshAccessToken

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }

    try {

        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECERT)

        const user = await User.findById(decodedToken?._id)

        if(!user){
            throw new ApiError(401, "Invalid Refresh Token")
        }

        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Your Authorized Refresh token is expired or used.")
        }

        // generate new tokens

       const {accessToken ,  newRefreshToken} = await generateAccessAndRefreshTokens(user._id)

       return res.status(200)
       .cookie("accessToken" , accessToken , options)
       .cookie("refreshToken" , newRefreshToken, options)
       .json(
        new ApiResponse(
            200,
            {accessToken,  refreshToken : newRefreshToken},
            "Successfull Access Token is refreshed"
        )
       )

        
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
        
    }
}) 


// Reset / Change the password:

const resetPassword = asyncHandler(async(req, res) =>{
    const {oldPassword, newPassword}  = req.body

    const user = await User.findById(req.user?._id)
    const passwordChecked = user.isPasswordCorrect(oldPassword)

    if (!passwordChecked) {
        throw new ApiError(400, "Invalid old Password")       
    }

    user.password = newPassword
    await user.save({validateBeforeSave : false})

    return res.status(200)
    .json(new ApiResponse(
        200,
        {},
        "Password Changed or updated  Successfully"
    ))
})
  
// get the current user 
// at route use authmiddleware to verify the user login or not!!

const getCurrentUser = asyncHandler(async(req, req) =>{

    return res.status(200)
    .json(200, req.user, "got current user successfully!!")
})

// update Account Details
// ->   get fullName, email
// -> sometimes(social media platforms) username is not advice to change
// Set the fullName, email using $set operator using findbyIdandUpdate
// remove the password while updating select("-password")
// return the user 

const updateAccountDetails = asyncHandler(async(req, res) =>{
    const {fullName, email} = req.body

    if(!fullName || !email){
        throw new ApiError(400, "All fields are required !")
    }

   const user = await User.findByIdAndUpdate
    (
        req.user?._id,
        {
            $set : {
                fullName : fullName,
                email: email
            }
        },
        {new : true}

    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(
        200,
        user,
        "User Account Details updated successfully"
    ))
})

//Update Avatar (user)
// use multer middleware to upload 
// upload on cloudinary
// error checks
// return user without password


const userAvatarUpdate = asyncHandler(async(req, res) => {

    const avatarLocalPath  = req.file?.path
    
    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is missing")
    }

    const avatar = uploadOnCloudinary(avatarLocalPath)

    if(!avatar.url){
        throw new ApiError(400, "Error while uploading the avatar")
    }

    const user = await User.findByIdAndUpdate
    (
        req.user?._id,
        {
            $set:{
                avatar : avatar.url
            }
        },
        {new: true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(
        200,
        user,
        "Avatar is updated Successfully"
    ))
})




// export

export {
    registerUser,
    loginUser, 
    userLogout,
    refreshAccessToken,
    resetPassword,
    getCurrentUser,
    updateAccountDetails,
    userAvatarUpdate

}