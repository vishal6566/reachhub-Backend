const mongoose=require("mongoose")


const connectDatabase=async()=>{
    return mongoose.connect(process.env.DB_URL)
}

module.exports=connectDatabase