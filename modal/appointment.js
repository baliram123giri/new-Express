const mongoose = require("mongoose")
 //creating schema
   const appointmentShema = new mongoose.Schema({
       user_id:{
           type:String
       },
       name:{
           type:String
       },
       email:{
           type:String
       },
       mobile:{
           type:Number
       },
       query_category:{
           type:String
       },
       time:{
           type:String
       },
       doctor_name:{type:String},
       date:{
           type:Date
       }
   })
//creating model
   const Appointment = new mongoose.model("Appointment", appointmentShema)
//Export to the Appointment module
   module.exports= Appointment