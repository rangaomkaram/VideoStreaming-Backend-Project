import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

//cors -> methods further for middleware
//corsOptions -> whitelisting and other options 

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

// configure
app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit: "16kb"}))

// Assests, images, etc
app.use(express.static("public"))
app.use(cookieParser())


export { app }