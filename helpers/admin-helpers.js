const async = require('hbs/lib/async')
var db = require('../config/connection')
const bcrypt = require('bcrypt')
const { ObjectId } = require('mongodb')
const { resolve } = require('promise')
var objectId = require('mongodb').ObjectId

module.exports = {
    loginCheck: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            console.log("reached adminhelperlogincheck",adminData)

            let admin = await db.get().collection('admin').findOne({ "email": adminData.email ,  "password": adminData.password })
            if (admin) {

                response.admin = admin
                response.status = true
                console.log("credentials are correct")
                resolve(response)
            } else {
                console.log("Credentials do not match")
                resolve({ status: false })
            }
        })
    },
    getAllUsers:()=>{
        return new Promise(async(resolve,reject)=>{
            let users= await db.get().collection('users').find().toArray()
            resolve(users)

        })
    },
    getAllOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            let orders= await db.get().collection('order').find().toArray()
            resolve(orders)
        })
    },
    shipOrder:(orderId)=>{
        return new Promise(async(resolve,reject)=>{
            await db.get().collection('order').updateOne({'_id':objectId(orderId)},
            {
            $set:{'status':'shipped'}
            }
            )
            resolve()
        })
    }

    
}