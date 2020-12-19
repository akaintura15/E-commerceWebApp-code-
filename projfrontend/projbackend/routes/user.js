const express=require("express")
 const router= express.Router()

const{ getUserById, getUser,updateUser,userPurchaseList} = require("../controllers/user")
const{isSignedIn,isAuthenticated,isAdmin} = require("../controllers/auth")

router.param("userId",getUserById)//call anything in this case userId 

router.get("/user/:userId",isSignedIn,isAuthenticated,getUser)//:any name will be given userId from param in this case we are using :userId
router.put("/user/:userId",isSignedIn,isAuthenticated,updateUser);//using same :userId so param will give the id here
router.get("/orders/user/:userId",isSignedIn,isAuthenticated,userPurchaseList);//using same :userId so param will give the id here//also making cross connection bw user and order


 
 module.exports= router;
