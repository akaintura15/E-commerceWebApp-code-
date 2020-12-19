//This is user schema there are 4 schemas in this model folder

var mongoose = require("mongoose");
const crypto = require('crypto');
const uuidv1 = require('uuid/v1');   //use this to get unique id

  var userSchema = new mongoose.Schema({     
   
    name:{
        type:String,
        required:true,
        maxlength:32,
        trim:true
    },
    lastname:{
        type:String,
        maxlength:32,
        trim:true
        
    },
    email:{
        type:String,
        trim:true,
        required:true,
        unique:true
    },

    userinfo:{
        type:String,
        trim :true
    },

    encry_password:{
        type:String,
        required:true
    },

    salt: String,

    role:{
            type:Number,
            default:0
    },

    purchases:{
            type:Array,
            default:[]
    }
  },
  {timestamps:true}
  );



userSchema.virtual("password") // virtual field referring as password its upto you
.set(function(password){
    this._password=password;
    this.salt=uuidv1();
    this.encry_password=this.securePassword(password);//taking from the function below 
})
.get(function(){
    return this._password;
});



userSchema.methods={                          //we have creating  methods here           
    authenticate:function(plainpassword){      //1st method
        return this.securePassword(plainpassword)===this.encry_password
    },
    securePassword:function(plainpassword){         //2nd function //defining a function
if(!plainpassword)
return  "";
try{
    return crypto.createHmac('sha256', this.salt)      //using crypto to secure password
    .update(plainpassword)
    .digest('hex');

}
catch(err){
    return ""; 

}
    }
}
//it expexts 2 parameters string and the name of the actual schema
  module.exports=mongoose.model("User",userSchema);//exporting the user schema we will refer and call it by User which is better than userSchema