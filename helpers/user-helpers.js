const async = require('hbs/lib/async')
var db=require('../config/connection')
const bcrypt=require('bcrypt')
const { ObjectId } = require('mongodb')
const { resolve } = require('promise')
var objectId=require('mongodb').ObjectId

module.exports={
    addUser: (userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.password= await bcrypt.hash(userData.password,10)
            db.get().collection('users').insertOne(userData).then((data)=>{
                
                resolve(data)
            })
        }) 
    },
    loginCheck: (userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus= false
            let response= {}
            
            let user= await db.get().collection('users').findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        response.user= user
                        response.status=true
                        console.log("credentials are correct")
                        resolve(response)
                    }else{
                        console.log("Credentials do not match")
                        resolve({status:false})
                    }
                })
            }else{
                console.log("user not found")
                resolve({status:false})
                
            }
        })
    },
    addToCart:(prodId,userId)=>{
        let prodObj={
            item:ObjectId(prodId),
            quantity:1
        }
        return new Promise(async(resolve,reject)=>{
            
            let userCart= await db.get().collection('cart').findOne({user:ObjectId(userId)})
            
            if(userCart){

                let proExist= userCart.products.findIndex(product=>product.item==prodId)
                if(proExist!= -1){
                    db.get().collection('cart').updateOne({'products.item':ObjectId(prodId), user:ObjectId(userId)},
                    {
                        $inc:{'products.$.quantity':1}
                    }
                    ).then(()=>{
                        resolve()
                    })
                }else{
                    db.get().collection('cart').updateOne({user:ObjectId(userId)},
                    {
                        $push:{products:prodObj}
                    }).then(()=>{
                        resolve()
                    })
                    
                }
    
            }else{
                
                
                let cartObj={
                    user:ObjectId(userId),
                    products:[prodObj]

                }
                db.get().collection('cart').insertOne(cartObj).then((response)=>{
                    resolve(response)
                })
            }
        })
       
    },
    getCartItems:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            
            cartItems= await db.get().collection('cart').aggregate([
                {
                    $match:{user:ObjectId(userId)}
                },
                {
                    $unwind: '$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup:{
                        from:'products',
                        localField:'item',
                        foreignField:'_id',
                        as:'product'
                    }
                }
            ]).toArray()
            
            if(cartItems.length===0){
                resolve(null)
            }else{
                
                resolve(cartItems)
                
            }
            
           
        })
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            
            cart= await db.get().collection('cart').findOne({user:ObjectId(userId)})
            
            if(cart){
                count=cart.products.length
            }
            resolve(count)
            
        })
    },
    changeProductQuantity:(details)=>{
        //console.log(details)
        details.count=parseInt(details.count)
        return new Promise((resolve,reject)=>{
            db.get().collection('cart').updateOne({'_id':ObjectId(details.cart), 'products.item':ObjectId(details.product)},
                    {
                        $inc:{'products.$.quantity':details.count}
                        
                    }
                    ).then((response)=>{
                        
                        resolve(response)
                    })
        })

    },
    deleteProduct:(details)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection('cart').updateOne({'_id':ObjectId(details.cart)},
                {
                    $pull:{products:{item:ObjectId(details.product)}}
                }
            ).then((response)=>{
                resolve(response)
            })
        })
    }
}