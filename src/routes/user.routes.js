import { Router } from "express";
import { loginUser, 
       registerUser,
       userLogout ,
        refreshAccessToken,
        resetPassword,
        getCurrentUser,
        updateAccountDetails,
        userAvatarUpdate,
       coverImageUpdate,
       getUserChannelProfile,
       getWatchHistory} from "../controllers/user.controller.js";
       
import {upload} from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )

router.route("/login").post(loginUser)

// Secure Routes

// POST - method

router.route("/logout").post(verifyJWT, userLogout)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/reset-password").post(verifyJWT,resetPassword)

//GET - method

router.route("/getCurrent-user").get(verifyJWT, getCurrentUser)
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)

//patch - method (The HTTP PATCH request method applies partial modifications to a resource.)

router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), userAvatarUpdate)
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), coverImageUpdate)







export default router;