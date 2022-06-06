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
            console.log(userData)
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
        return new Promise(async(resolve,reject)=>{
            
            let userCart= await db.get().collection('cart').findOne({user:ObjectId(userId)})
            
            if(userCart){
                
                db.get().collection('cart').updateOne({user:ObjectId(userId)},{
                    $push:{
                        products:ObjectId(prodId)
                    }
                }).then((response)=>{
                    console.log(response)
                    resolve(response)
                })
    
            }else{
                console.log("reached here")
                
                let cartObj={
                    user:ObjectId(userId),
                    products:[ObjectId(prodId)]

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
                    $lookup:{
                        let:{prodList:'$products'},
                        from: 'products',
                        pipeline:[
                            {
                                $match:{
                                    $expr:{
                                        $in:['$_id',"$$prodList"]
                                    }
                                }
                            }
                        ],
                        as:'cartItems'                       
                    }
                }
            ]).toArray()
            
            if(cartItems.length===0){
                resolve(null)
            }else{
                resolve(cartItems[0].cartItems)
            }
            
           
        })
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            console.log("reached getcartcount")
            cart= await db.get().collection('cart').findOne({user:ObjectId(userId)})
            console.log(cart)
            if(cart){
                count=cart.products.length
            }
            resolve(count)
            
        })
    }
}