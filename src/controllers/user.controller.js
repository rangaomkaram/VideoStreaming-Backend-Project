import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinaryService.js";

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
    console.log("username is : ", username)

    // check multiple fields using some
    if ([ fullName, email, username, password ].some((field) => field?.trim() === "" )) 
    {
        throw new ApiError(400, "All files are required")
    }
    
    //$ dollar operator is used for logic gate operations (or , nor , and etc)
    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "username or User with email is already exists")
    }

   const avatarLocalPath =  req.files?.avatar[0]?.path;
   const coverImgLocalPath = req.files?.coverImage[0]?.path;

   if(!avatarLocalPath){
    throw new ApiError(400, "Avatar file is required")
   }

   const avatar = uploadOnCloudinary(avatarLocalPath);
   const coverImage = uploadOnCloudinary(coverImgLocalPath);

   if(!avatar){
    throw new ApiError(400, "Avatar file / profile Image is required")
   }

   // object creation for DB entry

   User.create({
    fullName,
    username : username.toLowerCase(),
    email,
    password,
    coverImage : coverImage?.url || ""
   })
})

export {registerUser}