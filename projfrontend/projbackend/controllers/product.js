const Product = require("../models/product");
const formidable=require('formidable');
const _ =require("lodash");
const fs=require("fs");//file system for images comes with nodejs
const { sortBy } = require("lodash");

exports.getProductById = (req, res, next, id) => {
    Product.findById(id)
    .populate("category") //chain as many methods as you want
    //this is same populate method populating products based on category
    .exec((err,product) => {
      if (err) {
        return res.status(400).json({
          error: "Product not found in DB"
        });
      }
      req.product = product;
      next();
    });
  };

  exports.createProduct=(req,res)=>{
let form = new formidable.IncomingForm(); //using formidable form
form.keepExtensions =true;     //default

form.parse(req,(err,fields,file)=>{//this is the syntax
    if(err){
        return res.status(400).json({
            error:"Problem with image"
        })
    }
   
    //destructure the fields
    const {name,description,price,category,stock}=fields;// get fields.price||fields.name using this style
    if(
      !name || !description || !price || !category || !stock
    ){
return res.status(400).json({
  error:"please include all fields"
});
    }
    let product=new Product(fields) //product is being created based on this field

    //handle file here
    if(file.photo){  //call photo or anything else //here we are dealing with photos
      if(file.photo.size>3000000)      {
          return res.status(400).json({
              error:"file size is too big"
          })
      }          
      product.photo.data=fs.readFileSync(file.photo.path)//product have photo //and full path of file by filesystem//using formidable above
      product.photo.contentType=file.photo.type//type of file same as =rhs
      
     }
     //save to the DB
     product.save((err,product)=>{
         if(err){
             res.status(400).json({
                 error:"saving tshit in DB failed"
             })
         }
         res.json(product);
     })
})
  }
  exports.getProduct=(req,res)=>{
    req.product.photo=undefined;//only for performance optimization not necessary
    return res.json(req.product)
  }
  exports.photo=(req,res,next)=>{ //only for performance optimization not necessary
    if(req.product.photo.data){
      res.set("Content-Type",req.product.photo.contentType)
      return res.send(req.product.photo.data)

    }
    next();
  };

  //delete controllers
  exports.deleteProduct=(req,res)=>{
let product =req.product;
product.remove((err,deletedProduct)=>{
  if(err){
    return res.status(400).json({
      error:"Failed to delete product"
    })
  }
  res.json({
    message:"deletion was success",deletedProduct //show the deleted product
  })
})
  }
//update controllers
  exports.updateProduct=(req,res)=>{ //just like createProduct
    let form = new formidable.IncomingForm(); //using formidable form
form.keepExtensions =true;     //default

form.parse(req,(err,fields,file)=>{//this is the syntax
    if(err){
        return res.status(400).json({
            error:"Problem with image"
        })
    }
  //updation code
    let product=req.product; //getting from param
    product=_.extend(product,fields)//here comes lodash//fields are updated inside product

    //handle file here
    if(file.photo){  //call photo or anything else //here we are dealing with photos
      if(file.photo.size>3000000)      {
          return res.status(400).json({
              error:"file size is too big"
          })
      }          
      product.photo.data=fs.readFileSync(file.photo.path)//product have photo //and full path of file by filesystem//using formidable above
      product.photo.contentType=file.photo.type//type of file same as =rhs
     }
     //save to the DB
     product.save((err,product)=>{
         if(err){
             res.status(400).json({
                 error:"Updation in DB failed"
             })
         }
         res.json(product);
     })
})
  
  }


  exports.getAllProducts=(req,res)=>{
    let limit=req.query.limit ? parseInt(req.query.limit):8;
    let sortBy=req.query.sortBy ?req.query.sortBy :"_id"
Product.find()
.sort([[sortBy,"asc"]])
.populate("category")
.select("-photo")
.limit(limit)
.exec((err,products)=>{
if(err){
  return res.status(400).json({
    error:"NO PRODUCT FOUND"
  })
}
res.json(products)
})
  };

  exports.getAllUniqueCategories=(req,res)=>{
    Product.distinct("category",{},(err,category)=>{
      if(err){
        return res.status(400).json({
          error:"NO CATEGORY FOUND"
        })
      }
      res.json(category);
    });
  };

  exports.updateStock=(req,res,next)=>{
    let myOperations=req.body.order.products.map(prod=>{ //map loops through every single product
return{ 
  updateOne:{
    filter:{_id:prod._id},
    update:{$inc:{stock:-prod.count,sold:+prod.count}}
  }
}
    })
    Product.bulkWrite(myOperations,{},(err,products)=>{
      if(err){
        return res.status(400).json({
          error:"Bulk operation failed"
        })
      }
      next();
    })
  }


