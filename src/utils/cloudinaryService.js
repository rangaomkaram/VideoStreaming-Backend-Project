import {v2 as cloudinary} from 'cloudinary';
import fs from "fs";
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_COULD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECERT
});

const uploadOnCloudinary = async (localFilePath) => {
    try{
        if(!localFilePath) return "Cannot Find the upload file Path"
        //upload file on cloud
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:'auto'
        })
        //Print file uploaded successfully
        console.log("File has beed uploaded Successfully on Cloudinary!!",response.url)
        return response
    }
    catch(error){
        fs.unlinkSync(localFilePath) //which is used to remove the locally saved temporary file , if upload option failed
        return null; 
    }
}

cloudinary.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
  { public_id: "olympic_flag" }, 
  function(error, result) {console.log(result); });

export {uploadOnCloudinary}