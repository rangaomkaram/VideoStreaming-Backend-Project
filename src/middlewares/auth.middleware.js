// authentication (verification of user)
import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model"

/*
 concept of authorization from JWT as cookie or header
 for header we use Authorization
Authorization : Bearer  <Token>
*/
// response is not used for production grade code res (response) is replace with _
export const verifyJWT = asyncHandler(async(req, _, next) => {
   try {
    const token =  req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ","")
 
    if (!token) {
     throw new ApiError(401, "Unauthorized Request")
    }
 
    const decryptToken =  jwt.verify(token, process.env.ACCESS_TOKEN_SECERT)
 
    const user =  await User.findById(decryptToken?._id).select("-password -refreshToken")
 
    if (!user) {
     throw new ApiError(401, "Invalid Access Token")
     
    }
    req.user = user;
    next()

   } catch (error) {
    throw new ApiError(401, error?.message || "Invalid Access Token")
    
   }

})