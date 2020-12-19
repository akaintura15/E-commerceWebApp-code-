const User = require("../models/user")  //<= User is recommended to same as exported in user.js
const { check, validationResult } = require('express-validator');
const jwt= require("jsonwebtoken");
const expressJwt = require("express-jwt"); //changed the name to expressJwt from jwt


exports.signup = (req, res) => { 

 const errors=validationResult(req);

 if(!errors.isEmpty()){
   return res.status(422).json({
     error:errors.array()[0].msg
   });
 }

  const user = new User(req.body);
  user.save((err,user)=>{
    if(err){
      return res.status(400).json({
        err:"NOT ABLE TO SAVE USER IN DB "
      });
    }
    res.json({          //only these fields will be seen by user
      name: user.name,
      email: user.email,
      id: user._id
    });
  });
};

exports.signin=(req,res)=>{
  const errors=validationResult(req);
  const {email,password } = req.body;  //extracting email and password
  if(!errors.isEmpty()){
    return res.status(422).json({
      error:errors.array()[0].msg
    });
  }
  User.findOne({email},(err,user)=>{  //User model -finds one match on email
    if(err || !user){                          //if error if not then continue
      return res.status(400).json({
        error:"USER E-Mail DOES NOT EXISTS"
      })
    }
    if(!user.authenticate(password)){ //if email found the match password if !found then error
      return res.status(401).json({   // dont want further execution so use return here
  error:"email and password do not match"
});
    }
    //creating token
    const token=jwt.sign({_id: user._id},process.env.SECRET)  
    //putting token in cookie
    res.cookie("token",token,{expire:new Date() +9999}) // name of cookie is token
    const {_id,name,email,role} = user;
    return res.json({token,user:{_id,name,email,role}});

  });
};

exports.signout = (req, res) => {
  res.clearCookie("token") ;  // here we are clearing the cookie
  res.json({
    message: "User Signout sucessfully!"
  });
};
//protected routes
exports.isSignedIn = expressJwt({   // name the route anything in this case isSignedIn 
secret:process.env.SECRET,
userProperty :"auth"     //auth is containing the Id of user
})

//custom middleware
exports.isAuthenticated=(req,res,next)=>{
  let checker = req.profile && req.auth && req.profile._id == req.auth._id;
  if(!checker){
    return res.status(403).json({
      error:"Access Denied"
    });
  }
  next();
}

exports.isAdmin=(req,res,next)=>{
  if(req.profile.role===0){
    return res.status(403).json({
      error:"YOU ARE NOT ADMIN ACCESS DENIED"
    });
  }
  next();
}