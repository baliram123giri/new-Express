const jwt = require("jsonwebtoken")
//exporting to module of middle ware
//superadmin
const suerAdmin =(req,res,next)=>{
    try {
        const token = req.headers.authorization.split(" ")[1]
        const verify = jwt.verify(token, process.env.API_USER_AUTH_KEY)
         if(verify.user.user_type == 'Super_Admin'){
            next()
         }else{
             res.status(400).json({msg:"User is not SuperAdmin"})
         }
        
    } catch (error) {
        res.status(400).json({
            msg:"Invalid Token"
        })
    }
}
//normal user
const normalUer =(req,res,next)=>{
    try {
        const token = req.headers.authorization.split(" ")[1]
        const verify = jwt.verify(token, process.env.API_USER_AUTH_KEY)
         if(verify.user.user_type == 'normal_user'){
            next()
         }else{
             res.status(400).json({msg:"User is not normal_user"})
         }
        
    } catch (error) {
        res.status(400).json({
            msg:"Invalid Token"
        })
    }
}

//both user middleware 
const allUser = (req,res,next)=>{
    try {
        const token= req.headers.authorization.split(" ")[1]
        const verify = jwt.verify(token, process.env.API_USER_AUTH_KEY)
        const {user_type} = verify.user
        if((user_type==="normal_user")||(user_type==="Super_Admin") || (user_type==="doctor_user") ){
            next()
        }else{
            res.status(400).json({msg:"Invalid user credintials!"})
        }
    } catch (error) {
        res.status(400).json({
            msg:"Invalid Token"
        })
    }
}

//doctor auth
const doctorAuth =  (req,res, next)=>{
    try {
        const token= req.headers.authorization.split(" ")[1]
        const verify = jwt.verify(token, process.env.API_USER_AUTH_KEY)
        const {user_type} = verify.user
        if(user_type==="doctor_user"){
            next()
        }else{
            res.status(400).json({msg:"Invalid user credintials!"})
        }
    } catch (error) {
        res.status(400).json({msg:"Invalid Token!"})
    }
}

//doctor and superAdmin
 const doctorAndAsuperAdmin = (req,res, next)=>{
     try {
         const token = req.headers.authorization.split(" ")[1]
         const verify = jwt.verify(token, process.env.API_USER_AUTH_KEY)
         const {user_type} = verify.user
         if((user_type==="Super_Admin")||(user_type==="doctor_user")){
            next()
         }
         else{
            res.status(400).json({msg:"Invalid user credintials!"})
         }
     } catch (error) {
        res.status(400).json({msg:"Invalid Token!"})
     }
 }
module.exports= {suerAdmin, normalUer,allUser, doctorAuth, doctorAndAsuperAdmin}