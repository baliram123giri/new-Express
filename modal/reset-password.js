
const { default: mongoose } = require("mongoose")

const otpSchema = new mongoose.Schema({
    email:String,
    otp:String,
    expireIn:Number,
    createdAt: { type: Date, expires: '3m', default: Date.now }
   },

)

const Otp = new mongoose.model("Otp", otpSchema, "Otp")

module.exports= Otp