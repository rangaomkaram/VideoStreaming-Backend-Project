// require('dotenv').config({path:'./env'});

import dotenv from "dotenv";
import { app } from "./app.js";
import connectDB from "./db/index.js";


dotenv.config({
    path: './.env'
})


// import and Connecting DB 
connectDB()
.then(() =>{
    app.on
    app.listen(process.env.PORT || 8000, ()=> {
        console.log(`Server is running at port : ${process.env.PORT}`)
    })
})
.catch((error) => {
    console.log("MONGO db connection failed !!!", error)
})





































/* import express from "express";
   const app = express()

 
Concept of IIFE immediate function exceution, ()()
 


// TO have the clean code get semi colon before it start

;(async()=>{
    try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       app.on("error",(error)=>{
        console.log("ERROR: ",error);
        throw error
       })
       app.listen(process.env.PORT,()=>{
        console.log(`App is listening on port ${process.env.PORT}`)
       })
    } catch (error) {
        console.error("ERROR: ", error);
        throw error
        
    }
})()

*/