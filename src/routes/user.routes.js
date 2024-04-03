import { Router } from "express";
import { loginUser, 
       registerUser,
       userLogout ,
        refreshAccessToken,
        resetPassword,
        getCurrentUser,
        updateAccountDetails,
        userAvatarUpdate,
       coverImageUpdate} from "../controllers/user.controller.js";
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

//patch - method (The HTTP PATCH request method applies partial modifications to a resource.)

router.route("/update-user-account").patch(verifyJWT, updateAccountDetails)
router.route("/update-user-avatar").patch(verifyJWT, upload.single("avatar"), userAvatarUpdate)
router.route("/update-cover-image").patch(verifyJWT, upload.single("coverImage"), coverImageUpdate)






export default router;