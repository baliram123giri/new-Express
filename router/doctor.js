const express = require("express");
 const router =  express.Router()
 const checkAuth = require("../middleware/check-auth")
const {doctor} = require("../modal/doctor")
 //doctor get
  router.get("/doctors",checkAuth.allUser,async(req,res)=>{
      try {
          const result = await doctor.find({},  {specialist:1, fname:1, lname:1, _id:0})
          res.status(200).json(result)
      } catch (error) {
          res.status(400).json(error)
      }
  })

//modile exporting

module.exports=router