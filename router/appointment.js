const express = require ("express")
const router = new express.Router()
const {body, validationResult} = require("express-validator")
//importing to appointment module here
  const Appointment = require("../modal/appointment")
  const checkAuth = require("../middleware/check-auth")
//appointmet create route
  router.post("/appointment",checkAuth.normalUer,
       body("name").notEmpty().withMessage("please enter your name!"),
        body("email").notEmpty().withMessage("please enter your email!").isEmail().withMessage("invalid email!"),
        body("mobile").notEmpty().withMessage("please enter you mobile number!").isLength({min:10, max:10}).withMessage("please enter valid number!").isNumeric().withMessage("number must be numeric!"),
        body("date").notEmpty().withMessage("please select date!"),
        body("query_category").notEmpty().withMessage("please select query category!"),
        async(req,res,next)=>{
         try {
          const errors = validationResult(req );
          if (!errors.isEmpty()) {
            // console.log(req.body)
                       res.status(400).send({msg:errors.array()[0].msg})
             }
              else{
                const appointment = new Appointment(req.body)
                 await appointment.save()
                 res.status(200).json({
                   msg:"appointment booked successfully!"
                 })
              }
         } catch (error) {
             res.status(400).json(error)
         }
  })

//appointmet getting info route
  router.get("/appointment",checkAuth.suerAdmin, async(req,res,next)=>{

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
           Appointment.count({},function(err,count){
            Appointment.find({}, null, {}).skip(page > 0 ? ((page - 1) * size) : 0).limit(size).exec(function(err, docs) {
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

//appointmet getting Single info with id route
  router.get("/appointment/:id", checkAuth.allUser, async(req,res,next)=>{
    try {
      var {page, size} = req.query
      if(!page){
        page = 1
      }
      if(!size){
        size=5
      }
    const result = await Appointment.find({user_id:req.params.id}).skip((page-1)*size).limit(size)
    const pagecount = await Appointment.find({user_id:req.params.id})
    res.status(200).json({
      "data": result, "meta":{"total": pagecount.length, "pageCount": Math.ceil(pagecount.length/size)  ,page, size, }
    })
    } catch (error) {
     res.status(400).json(error)
    }
  })

//appointmet getting Single info with doctorname route
  router.get("/appointment/find/:doctorname", checkAuth.doctorAuth, async(req,res,next)=>{
    try {
      var {page, size} = req.query
      if(!page){
        page = 1
      }
      if(!size){
        size=5
      }
    
    const result = await Appointment.find({doctor_name:req.params.doctorname}).skip((page-1)*size).limit(size)
    const pagecount = await Appointment.find({doctor_name:req.params.doctorname})
  
      res.status(200).json({
        "data": result, "meta":{"total": pagecount.length, "pageCount": Math.ceil(pagecount.length/size)  ,page, size, }
      })
   
    } catch (error) {
     res.status(400).json({msg:"Doctor not Found!", error})
    }
  })

//appointment delete
 router.delete("/appointment/:id",checkAuth.allUser,async (req,res,next)=>{
     try {
        const _idFind = await Appointment.findOne({_id:req.params.id})
        if(_idFind){
          await Appointment.findOneAndDelete({_id:req.params.id})
          res.status(200).json({
            msg:"Appointment Deleted Successfully!" 
          })
        }else{
          res.status(400).json({
            msg:"Appointment id not found"
          })
        }
     } catch (error) {
      res.status(400).json({
        msg:"Appointment id not found"
      })
     }
 })

//export to the appointment route
  module.exports = router