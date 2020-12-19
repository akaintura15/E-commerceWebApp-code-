const User= require("../models/user"); 
const Order=require("../models/order")

exports.getUserById= (req,res,next,id)=>{ //THIS METHOD WILL HELP HANDLING PARAM
    User.findById(id).exec((err,user)=>{ //chaining it with the execute method which will give err and user
if(err || !user){
return res.status(400).json({
    error:"No user found in DB"
})
}
req.profile = user; //creating profile object inside request to store this user which we are getting from above exec() method
next();
    })
};

exports.getUser = (req,res)=>{       //simple method to show user
    req.profile.salt=undefined;       // all 4 fields should not be displayed so set undefined
    req.profile.encry_password=undefined;
    req.profile.createdAt=undefined;
    req.profile.updatedAt=undefined;
    return res.json(req.profile) //getting this user from above param method
}

exports.updateUser=(req,res)=>{ 
User.findByIdAndUpdate({_id:req.profile._id},//id comming from  routes users visit there//basically from getUserById above
    {$set:req.body},                         //$set is used to update here we are updating req,body
    {new:true,useFindAndModify:false},//these are compulsory parameters we need in case of findByIdAndUpdate
    (err,user)=>{     
        if(err){
        return res.status(400).json({
            error:"YOU ARE NOT AUTHORIZED TO UPDATE"
        })
    }
    user.salt=undefined;       // all 4 fields should not be displayed so set undefined
    user.encry_password=undefined;
    user.createdAt=undefined;
    user.updatedAt=undefined;
      res.json(user)  

    }
     )
}

exports.userPurchaseList=(req,res)=>{//special method //making cross connection b/w user and order
Order.find({user:req.profile._id})//populated by middleware getUserById above//pulling out orders based on id
//orders that are pushed in by a user id are being pulled out
.populate("user","_id name email")//which model you want to update  
.exec((err,order)=>{         
    if(err){
        return res.status(400).json({
            error:"No Order in this account"
        })
    }
    return res.json(order)
})
}


exports.pushOrderInPurchaseList=(req,res,next)=>{ //middleware
    
let purchases=[]
req.body.order.products.forEach(product =>{
    purchases.push({
        _id: product._id,
        name:product.name,
        description:product.description,
        category:product.category,
        quantity:product.quantity,
        amount: req.body.order.amount,
        transaction_id:req.body.order.transaction_id
    });
});

User.findOneAndUpdate(
    {_id:req.profile._id},
    {$push:{purchases:purchases}},
    {new:true},
    (err,purchases)=>{
        if(err){
            return res.status(400).json({
                error:"Unable to save purchase list"
            })
        }
    }
    
    
    )
    next()
    };
