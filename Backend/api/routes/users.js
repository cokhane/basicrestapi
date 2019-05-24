const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')



router.get('/', (req,res,next) => {
  // res.status(200).json({
  //   message:'Handling GET request to /products'
  // })

  User.find()
  .exec()
  .then(docs => {
    const response = {
      count:docs.length,
      products: docs.map(item => {
        return{
          email:item.email,
          _id: item._id,
          request : {
            type: 'GET',
            url: 'http://localhost:4000/users/' + item._id
          }
        }
      })
    }


    if(docs.length > 0){
      res.status(200).json(response)
    }else{
      res.status(404).json({
        message: 'No entries found'
      })
    }
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({
      error:err
    })
  })
})


router.post('/signup', (req, res, next) => {
  User.find({email:req.body.email})
  .exec()
  .then(user => {
    if(user.length >= 1){
      return res.status(409).json({
        message:'Mail exists'
      })
    }else{
      bcrypt.hash(req.body.password, 10, (err, hash) => {
       if(err){
         console.log('true')
         return res.status(500).json({
           error:err
         })
       }else{
         const user = new User({
           _id: new mongoose.Types.ObjectId(),
           email: req.body.email,
           password: hash
         })
         user.save()
         .then(result => {
           console.log(result)
           res.status(201).json({
             message:'User Created Successfully'
           })
         }).catch(err => {
           res.status(500).json({
             error:err
           })
         })

       }
     })
    }
  })
  })

  router.post('/login', (req,res,next) => {
    console.log('yeah')
    User.find({email:req.body.email})
    .exec()
    .then(user => {
      if(user.length < 1){
        return res.status(404).json({
          message: 'Auth failed'
        })
      }
      bcrypt.compare(req.body.password,user[0].password, (err,result) => {
        if(err){
          return res.status(404).json({
            message: 'Auth failed'
          })
        }
        if(result){
          const token = jwt.sign({
            email:user[0].email,
            userId: user[0]._id
          },process.env.JWT_KEY,{
            expiresIn:"1h"
          })

          return res.status(200).json({
            message: 'Auth Successfully',
            token:token
          })
        }
        res.status(401).json({
            message: 'Auth failed'
        })
      })
    })
    .catch(err => {
      res.status(500).json({
        error:err
      })
    })
  })

  router.delete('/:userId', (req, res, next) => {
    const id = req.params.userId
    User.deleteOne({ _id:id })
      .exec()
      .then(result => {
        res.status(200).json({
          message:"Delete Success!",
          request:{
            type: 'POST',
            url: 'http://localhost:4000/users/',
            body: {name: 'String', price: 'Number'}
          }
        })
      })
      .catch(err => {
        console.log(err)
        res.status(500).json({
          error:err
        })
      })

  })

  // router.delete('/:userId', (req, res, next) => {
  //   User.deleteOne({_id: req.params.userId})
  //   .exec()
  //   .then(result => {
  //     console.log(result)
  //     result.status(200).json({
  //       message: "User deleted"
  //     })
  //   })
  //   .catch(err => {
  //     res.status(500).json({
  //       error:err
  //     })
  //   })
  // })




module.exports = router;
