const { default: mongoose } = require("mongoose");

//create schema 
 const doctorSchema = new mongoose.Schema({
     fname:String,
     lname:String,
     username:String,
     password:String,
     email:String,
     mobile: Number,
     specialist:String,
     gender:String,
     country:String,
     state:String,
     user_type:{
         type:String,
         default:"doctor_user"
     },
     active:{
         type:Boolean,
         default:false
     }
 })
//create model
const doctor = new mongoose.model("Doctor", doctorSchema)

module.exports = {doctor}