var express = require('express')
var router= express.Router()
const { check,validationResult } = require('express-validator'); //this is express validator for validation

const {signout,signup,signin, isSignedIn}=require("../controllers/auth")

router.post("/signup",[ //this array like structure we are validating the input
    check("name").isLength({ min: 3 }).withMessage('must be at least 5 chars long'),
    check("email").isEmail().withMessage('email is required'),
    check("password").isLength({ min: 3 }).withMessage('must be at least 3 chars long')
],signup);

router.post("/signin",[ //this array like structure we are validating the input
    check("email").isEmail().withMessage('email is required'),
    check("password").isLength({ min: 3 }).withMessage('must be at least 3 chars long')
],signin);



router.get("/signout",signout);

router.get("/testroute",isSignedIn,(req,res)=>{ //importing isSignedIn 
    res.send("A protected route");
});
module.exports = router;