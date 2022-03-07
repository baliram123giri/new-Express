const express = require ("express")
const router = express.Router()
const userCreate = require("../modal/user")
const OtpCreate = require("../modal/reset-password")
const {doctor} = require("../modal/doctor")
const  bcrypt = require ("bcrypt")
const {body, validationResult} = require("express-validator")
const jwt = require("jsonwebtoken")
const nodemailer = require("nodemailer");
 //creating user router
 router.post("/user/create",
               body("fname", "Please enter your first name").notEmpty(),
               body("lname", "Please enter your last name").notEmpty(),
               body("email").notEmpty().withMessage("Please enter you email").isEmail().withMessage("Invalid email"),
               body("mobile").notEmpty().withMessage("Please enter mobile number!").isLength({min:10, max:10}).withMessage("Invalid mobile number!"),
               body("password").isLength({min:5}).withMessage('Password must be at least 5 chars long').matches(/\d/).withMessage('Password must contain a number'),
               async (req, res, next)=>{
                   try {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                                 res.status(400).json({msg:errors.array()[0].msg})
                           }
                           else{
                            const email = await userCreate.findOne({email:req.body.email})
                                    if(email){
                                      //user error handling or email checking   
                                           res.status(400).json({
                                               msg:"Email already in use!"
                                           })
                                    }else{
                                      //user creating
                                        bcrypt.hash(req.body.password, 10, async (err, hash)=>{
                                            if(err){
                                                res.status(400).json({
                                                    msg:"Internal Server Error"
                                                })
                                            }else{
                                              const result = new userCreate({...req.body, password:hash})
                                                await result.save()
                                                res.status(200).json({
                                                    msg:"User Created Successfully!"
                                                })
                                            }
                                     })
                                    }
                              
                           }
                   } catch (error) {
                       res.status(400).json(error)
                   }
                 }
 )

//login router
    router.post("/user/login", async (req,res, next)=>{
                try {
                    const {email, password} = req.body
                    // console.log(req.body)
                      var user = await userCreate.findOne({email:email})
                       if(user){
                          const validPassword = await bcrypt.compare(password, user.password)
                              if((validPassword) && (email === user.email) ){
                                //here i remove the password property from user object
                                  user.password = undefined;
                                  const token = jwt.sign(
                                   { user},
                                   process.env.API_USER_AUTH_KEY, 
                                    {expiresIn:'24h'}
                                  )
                                  res.status(200).json({user, token:token})
                              }else{
                                    res.status(400).json({ msg:"email or password is wrong!"})
                              }
                          
                         
                        // res.status(200).json(user.password)
                       }else{
                        res.status(400).json({
                            msg:"email or password is wrong!"
                        })
                       }
                  
                } catch (error) {
                    res.status(400).json(error)
                }
    
    })

//user info getting
   router.get("/users", async (req,res,next)=>{
          try {
            var {page, size} = req.query
 
            if(!page){
              page = 1
            }
            if(!size){
              size=5
            }
           //  console.log(page, size)
           //  const limit = parseInt(size)
            userCreate.count({},function(err,count){
             userCreate.find({}, null, {}).skip(page > 0 ? ((page - 1) * size) : 0).limit(size).exec(function(err, docs) {
               if (err)
                 res.json(err);
               else{
                 var totalCount = Math.ceil(count/size)
                 res.json({
                   "data": docs, "meta":{"total": count, "pageCount": totalCount,page, size, }
                 });
               }
                
             });
            });
          } catch (error) {
              res.status(400).json(error)
          }
   })

 //email password otp send
   router.post("/users/email-send", async(req,res,next)=>{
       const email = await userCreate.findOne({email:req.body.email})
       if(email){
         let randOtp= Math.floor(Math.random() * 899999 + 100000) 
         let otpData = new OtpCreate({...req.body,otp:randOtp, expireIn:(new Date().getTime()) + (300*1000)})
         await otpData.save()
         emailSendHandler(otpData.email, randOtp)
         res.status(200).json({
           msg:"Please check your email id"
         })
       }else{
         res.status(400).json({
           msg:"Email isn't exist!"
         })
       }
   })
 //email otp password change
   router.put("/users/fogot-pass", async(req,res,next)=>{
         try {
           const result = await OtpCreate.findOne({otp:req.body.otp, email:req.body.email})
           if(result){
              let dif = (result.expireIn)-(new Date().getTime())
              if(dif<0){
                res.status(400).json({msg:"otp has been expire!"})
              }else{
                //user password changing
                   //user creating
                   bcrypt.hash(req.body.password, 10, async (err, hash)=>{
                    if(err){
                        res.status(400).json({
                            msg:"Internal Server Error"
                        })
                    }else{
                      await userCreate.updateOne({email:req.body.email}, {password:hash})
                          res.status(200).json({
                            msg:"Password Changed Successfully!",  
                          })
                      
                    }
                 })

              }
            // const result = await userCreate.updateOne({password:})
           }else{
            res.status(400).json({
              msg:"Invalid Otp"
            })
           }
         } catch (error) {
           res.status(400).json(error)
         }
   })
//eamil send function
const emailSendHandler =(email, otp)=>{
  const transport = nodemailer.createTransport({
    service: "gmail",
    secure:true,
      auth: {
        user: 'giriheakthcares@gmail.com',
        pass: "Baliram@321", 
      },
      tls:{
        rejectUnauthorized: false
      }
  })

  const mailOption = {
    from: '"giri-healths" <giri71401@gmail.com>', // sender address
    to: `${email}`, // list of receivers
    subject: "Password Change ", // Subject line
    html: `<p>Dear <>,</p> </br> </br>
           <p>Kindly use OTP: ${otp} to update your password on Giri-healths Portal.Regards,</p> </br> </br>
           <p>Note:Password is confidential, do not share with any one for security reason
           Plesae update your mobile number in system if it is changed</p> </br> </br>
           <a href="http://localhost:3000/admin" target="_blank"> Click here </a>
           `, // html body
  }

  transport.sendMail(mailOption, function(err, data){
    if(err){
      res.status(400).json(err)
    }else{
      res.status(200).json({"msg":"email has been sent successfully!"})
    }
  })
}
   

//docto create router
router.post("/user/doctor",
    body("fname").notEmpty().withMessage("Please enter your first name! "), 
    body("lname").notEmpty().withMessage("Please enter your last name!"), 
    body("username").notEmpty().withMessage("Please enter your username!").isLength({min:6}).withMessage("Username must be at least 5 chars long!"), 
    body("password").notEmpty().withMessage("Please enter your password!").isLength({min:6}).withMessage("Password must be at least 5 chars long!"), 
    body("email").notEmpty().isEmail().withMessage("Please enter valid email!"), 
    body("mobile").notEmpty().withMessage("Please enter mobile number!").isLength({min:10, max:10}).withMessage("Invalid mobile number!"),
    body("specialist").notEmpty().withMessage("Please enter your specialisties!"),
    body("gender").notEmpty().withMessage("Please select your gender!"),
    body("country").notEmpty().withMessage("Please select your country!"),
    body("state").notEmpty().withMessage("Please select your state!")
    , async(req,res,next)=>{
        try {
          const errors = validationResult(req);
          if (!errors.isEmpty()) {
                       res.status(400).json({msg:errors.array()[0].msg})
                 }else{
                      //let's check if user already in database or not
                      const emailCheck = await doctor.findOne({email:req.body.email})
                      if(!emailCheck){
                          //let's bcrypt to the password
                          bcrypt.hash(req.body.password, 10, async (err, hash)=>{
                            //let's check if error!
                            if(!err){
                              const doctorData = new doctor({...req.body, password:hash})
                               await doctorData.save()
                              res.status(200).json({msg:"User Registered successfully..."})
                            }
                          })
                      }else{
                        res.status(400).json({msg:"Email is already in use!"})
                      }
                 }
         
        } catch (error) {
          res.status(400).json(error)
        }
})

//doctor Login router
router.post("/user/doctor-login", async(req,res)=>{
  try {
     const user = await doctor.findOne({email:req.body.email})
      //checkig eamil if user is exist or not
      if(user){
        //fetching data and compare
        const validatePass  = await bcrypt.compare(req.body.password, user.password)
        if((validatePass) && (req.body.email===user.email)){
           //undefined to the user password we don't want to serve password to the user
            user.password=undefined
            //let's create jwt token
           const token = jwt.sign({user},process.env.API_USER_AUTH_KEY, {expiresIn:"24hr"})
            res.status(200).json({user, token})
        }else{
          res.status(400).json({msg:"User Email or password is wrong!"})
        }

        
      }else{
        res.status(400).json({msg:"User Email or password is wrong!"})
      }
  } catch (error) {
    
  }
})
module.exports = router