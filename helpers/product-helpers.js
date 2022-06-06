const async = require('hbs/lib/async')
const { ObjectId } = require('mongodb')
const fs= require('fs')
var db=require('../config/connection')
const { resolve } = require('path')
var objectId=require('mongodb').ObjectId
module.exports={

    addProduct:(product,callback)=>{
        db.get().collection('products').insertOne(product).then((data)=>{
            
            callback(data.insertedId)
        })
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products= await db.get().collection('products').find().toArray()
            resolve(products)

        })

    },
    deleteProduct:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('products').deleteOne({_id:objectId(prodId)}).then((response)=>{
                resolve(response)
                
            fs.unlinkSync('./public/images/productImages/'+prodId+'.jpg')
                
            })
        })
    },
    getProductDetails:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('products').findOne({_id:ObjectId(prodId)}).then((product)=>{
                resolve(product)
                
            })
        })
    },
    updateProduct:(prodId,prodDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('products').updateOne({_id:ObjectId(prodId)},{
                $set:{
                    name:prodDetails.name,
                    category:prodDetails.category,
                    price:prodDetails.price
                }
            }).then((response)=>{
                resolve(response)
            })
        })
        
    }
    
}