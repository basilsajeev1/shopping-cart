var express = require('express');
const async = require('hbs/lib/async');
const { resolve } = require('promise');
const { response } = require('../app');
var db=require('../config/connection')
var router = express.Router();
var productHelpers= require('../helpers/product-helpers');
const { loginCheck } = require('../helpers/user-helpers');
var userHelpers= require('../helpers/user-helpers')

/* GET home page. */
router.get('/', async function(req, res, next) {
  user=req.session.user
  let cartCount=null
  if(user){
    cartCount= await userHelpers.getCartCount(user._id)
    
  }
  productHelpers.getAllProducts().then((products)=>{

    res.render('user/index', { products,user, cartCount, admin:false });
  })
  
});

router.get('/login', function(req, res, next) {
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
  res.render('user/login',{loginErr:req.session.loginErr});
  req.session.loginErr=false
  }
    
});

router.post('/login',(req,res)=>{
  userHelpers.loginCheck(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      res.redirect('/')
      
    }else{
      req.session.loginErr="Invalid Email or Password"
      res.redirect('/login')
    }
  })
})

router.get('/signup', function(req, res, next) {

  res.render('user/signup');
    
});

router.post('/signup',(req,res)=>{
  userHelpers.addUser(req.body).then(async(response)=>{
    
    user= await db.get().collection('users').findOne({_id:response.insertedId})
    req.session.loggedIn=true
    req.session.user=user
    res.redirect('/')
  })
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

router.get('/add-to-cart/:id',(req,res)=>{
  
    if(req.session.loggedIn){
      userHelpers.addToCart(req.params.id,req.session.user._id).then((response)=>{
        res.json({status:true})
      })

    }else{
      res.redirect('/login')
    }
  
  
})

router.get('/cart',async(req,res)=>{
  user=req.session.user
  let totalAmount=0
  
  cartItems= await userHelpers.getCartItems(req.session.user._id)
  if(cartItems.length>0){
  totalAmount= await userHelpers.getTotalAmount(req.session.user._id)
  }
  res.render('user/cart',{user,cartItems, totalAmount})
  //console.log(cartItems)
  //console.log(cartItems[0].product)
  
})

router.post('/change-product-quantity',async(req,res)=>{
  
  await userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.totalAmount= await userHelpers.getTotalAmount(req.body.user)
    response.status= true
    res.json(response)
    
    
  })
})

router.post('/delete-product',async(req,res)=>{
  await userHelpers.deleteProduct(req.body).then((response)=>{
      res.json({status:true})
  })
  
})

router.get('/order-page',async(req,res)=>{
  user=req.session.user
  await userHelpers.getTotalAmount(user._id).then((total)=>{
    res.render('user/order',{user, total})
  })
  
})

router.post('/order-page',async(req,res)=>{
  
  let products= await userHelpers.getProductDetails(req.session.user._id)
  let totalPrice= await userHelpers.getTotalAmount(req.session.user._id)
  
  await userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body.payment==='cod'){
      res.json({codSuccess:true})
    }else{
      
      userHelpers.generateRazorpay(orderId,totalPrice).then((order)=>{
        
        res.json({order})
        
      })
    }
    
    
  })
})

router.get('/orderlist',async(req,res)=>{
  user=req.session.user
  let order= await db.get().collection('order').find({'user':user._id}).toArray()
  res.render('user/orderlist',{user,order})
})

router.post('/verify-payment',(req,res)=>{
  //console.log("reached verify-payment router",req.body)
  userHelpers.verifyPayment(req.body).then((response)=>{
    userHelpers.updateOrderStatus(req.body).then(()=>{
      console.log("order status updated")
      res.json({status:true})
    })
    
  })
})

module.exports = router;
