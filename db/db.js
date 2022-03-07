//import to the monggose for make the connection
 const mongoose = require("mongoose")

//mongodb url
 const mongoAtlasUri = process.env.DB_CONN

 try{
     mongoose.connect(
         mongoAtlasUri, {useNewUrlParser:true, useUnifiedTopology:true}
     )
     console.log("connection success")
 }catch(e){
         console.log("could not be connect!",e)
 }